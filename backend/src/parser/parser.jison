%left   'OR'
%left   'AND'
%left   'NOT'
%left   '=' '!=' '<' '<=' '>' '>='
%left   '+' '-'
%left   '/' '*' '%'
%left   UMINUS

%%

querys:
    stmts EOF
    {
        $$ = $1
        return $$
    }
;

stmts:
    stmts stmt ';'
    {
        $1.push($2)
        $$ = $1
    }
    |
    stmt ';'
    {
        $$ = []
        $$.push($1)
    }
;

stmt:
    create_table
    |
    alter_table
    |
    drop_table
    |
    PRINT expr
    {$$ = new Stmt.Print(treeID++, $2)}
    |
    select_from
    |
    select_print
    |
    insert_into
    |
    update
    |
    delete_from
    |
    truncate
    |
    if_stmt
    |
    case_stmt
    |
    block_stmt
    |
    for_stmt
    |
    while_stmt
;

block_stmt:
    BEGIN extended_stmts END
    {$$ = new Stmt.Block(treeID++, $2)}
;

extended_stmts:
    extended_stmts extended_stmt ';'
    {
        $$ = $1
        $$.push($2)
    }
    |
    extended_stmt ';'
    {
        $$ = []
        $$.push($1)
    }
;

extended_stmt:
    var_declaration
    |
    var_default
    |
    var_assignment
    |
    BREAK
    {$$ = new Stmt.Break(treeID++)}
    |
    CONTINUE
    {$$ = new Stmt.Continue(treeID++)}
    |
    stmt
;

if_stmt:
    IF expr THEN extended_stmts else_stmt END IF
    {$$ = new Stmt.If(treeID++, $2, $4, $5)}
;

else_stmt:
    ELSE extended_stmts
    {$$ = $2}
    |
    /* epsilon */
;

case_stmt:
    CASE expr cases ELSE expr END asign_alias
    {$$ = new Stmt.Case(treeID++, $2, $3, $5, $7)}
;

cases:
    cases WHEN expr THEN expr
    {
        $$ = $1
        $$.push([$3, $5])
    }
    |
    WHEN expr THEN expr
    {
        $$ = []
        $$.push([$2, $4])
    }
;

for_stmt:
    FOR identifier IN INT_LITERAL '..' INT_LITERAL block_stmt
    {$$ = new Stmt.For(treeID++, $2, $4, $6, $7)}
;

while_stmt:
    WHILE expr block_stmt
    {$$ = new Stmt.While(treeID++, $2, $3)}
;

var_declaration:
    DECLARE var_list
    {$$ = new Stmt.Declare(treeID++, $2)}
;

var_list:
    var_list ',' '@' identifier type
    {
        $$ = $1
        $$.push([$4, $5])
    }
    |
    '@' identifier type
    {
        $$ = []
        $$.push([$2, $3])
    }
;

var_default:
    DECLARE '@' identifier type DEFAULT expr
    {$$ = new Stmt.DeclareDefault(treeID++, $3, $4, $6)}
;

var_assignment:
    SET '@' identifier '=' expr
    {$$ = new Stmt.Set(treeID++, $3, $5)}
;

create_table:
    CREATE TABLE identifier '(' col_declaration ')'
    {$$ = new Stmt.CreateTable(treeID++, $3, $5)}
;

col_declaration:
    col_declaration ',' identifier type
    {
        $$ = $1
        $$.push([$3, $4])
    }
    |
    identifier type
    {
        $$ = []
        $$.push([$1, $2])
    }
;

alter_table:
    ALTER TABLE identifier alter_action
    {$$ = new Stmt.AlterTable(treeID++, $3, $4)}
;

alter_action:
    ADD identifier type
    {$$ = ['ADD', $2, $3]}
    |
    DROP COLUMN identifier
    {$$ = ['DROP', $3]}
    |
    RENAME TO identifier
    {$$ = ['RENAME', $3]}
    |
    RENAME COLUMN identifier TO identifier
    {$$ = ['RENAME_C', $3, $5]}
;

drop_table:
    DROP TABLE identifier
    {$$ = new Stmt.DropTable(treeID++, $3)}
;

insert_into:
    INSERT INTO identifier '(' column_list ')'
    VALUES '(' value_list ')'
    {$$ = new Stmt.InsertInto(treeID++, $3, $5, $9)}
;

column_list:
    column_list ',' identifier
    {
        $$ = $1
        $$.push($3)
    }
    |
    identifier
    {
        $$ = []
        $$.push($1)
    }
;

value_list:
    value_list ',' expr
    {
        $$ = $1
        $$.push($3)
    }
    |
    expr
    {
        $$ = []
        $$.push($1)
    }
;

select_print:
    SELECT selection
    {$$ = new Stmt.Select(treeID++, $2)}
;

select_from:
    SELECT '*' FROM identifier where
    {$$ = new Stmt.SelectFrom(treeID++, $4, $2, $5)}
    |
    SELECT selection FROM identifier where
    {$$ = new Stmt.SelectFrom(treeID++, $4, $2, $5)}
;

selection:
    selection ',' expr asign_alias
    {
        $$ = $1
        $$.push([$3, $4])
    }
    |
    expr asign_alias
    {
        $$ = []
        $$.push([$1, $2])
    }
;

asign_alias:
    AS identifier
    {$$ = $2}
    |
    AS string_literal
    {$$ = $2}
    |
    /* epsilon */
;

where:
    WHERE conditions
    {$$ = $2}
    |
    /* epsilon */
;

conditions:
    conditions AND condition
    {$$ = new Expr.Binary(treeID++, $1, 'AND', $3)}
    |
    conditions OR condition
    {$$ = new Expr.Binary(treeID++, $1, 'OR', $3)}
    |
    condition
;

condition:
    column_name '=' cond_expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    column_name '!=' cond_expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    column_name '<' cond_expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    column_name '<=' cond_expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    column_name '>' cond_expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    column_name '>=' cond_expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
;

column_name:
    identifier
    {$$ = new Expr.Identifier(treeID++, $1)}
;

cond_expr:
    cond_expr '+' cond_expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    cond_expr '-' cond_expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    cond_expr '*' cond_expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    cond_expr '/' cond_expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    cond_expr '%' cond_expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    '-' cond_expr %prec UMINUS
    {$$ = new Expr.Unary(treeID++, $1, $2)}
    |
    '(' cond_expr ')'
    {$$ = new Expr.Group(treeID++, $2)}
    |
    '@' identifier
    {$$ = new Expr.Variable(treeID++, $2)}
    |
    literal
;

native_func:
    CAST '(' expr AS type ')'
    {$$ = new Expr.Cast(treeID++, $3, $5)}
;

update:
    UPDATE identifier SET update_list where
    {$$ = new Stmt.UpdateTable(treeID++, $2, $4, $5)}
;

update_list:
    update_list ',' identifier '=' expr
    {
        $$ = $1
        $$.push([$3, $5])
    }
    |
    identifier '=' expr
    {
        $$ = []
        $$.push([$1, $3])
    }
;

truncate:
    TRUNCATE TABLE identifier
    {$$ = new Stmt.TruncateTable(treeID++, $3)}
;

delete_from:
    DELETE FROM identifier where
    {$$ = new Stmt.DeleteFrom(treeID++, $3, $4)}
;

expr:
    expr '+' expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    expr '-' expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    expr '*' expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    expr '/' expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    expr '%' expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    expr '=' expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    expr '!=' expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    expr '<' expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    expr '<=' expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    expr '>' expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    expr '>=' expr
    {$$ = new Expr.Binary(treeID++, $1, $2, $3)}
    |
    expr AND expr
    {$$ = new Expr.Binary(treeID++, $1, 'AND', $3)}
    |
    expr OR expr
    {$$ = new Expr.Binary(treeID++, $1, 'OR', $3)}
    |
    '-' expr %prec UMINUS
    {$$ = new Expr.Unary(treeID++, $1, $2)}
    |
    NOT expr
    {$$ = new Expr.Unary(treeID++, 'NOT', $2)}
    |
    '(' expr ')'
    {$$ = new Expr.Group(treeID++, $2)}
    |
    '@' identifier
    {$$ = new Expr.Variable(treeID++, $2)}
    |
    identifier
    {$$ = new Expr.Identifier(treeID++, $1)}
    |
    native_func
    |
    literal
;

literal:
    INT_LITERAL
    {$$ = new Expr.Literal(treeID++, 'INT', $1)}
    |
    DOUBLE_LITERAL
    {$$ = new Expr.Literal(treeID++, 'DOUBLE', $1)}
    |
    DATE_LITERAL
    {$$ = new Expr.Literal(treeID++, 'DATE', $1)}
    |
    string_literal
    {$$ = new Expr.Literal(treeID++, 'STRING', $1)}
    |
    TRUE
    {$$ = new Expr.Literal(treeID++, 'BOOLEAN', $1)}
    |
    FALSE
    {$$ = new Expr.Literal(treeID++, 'BOOLEAN', $1)}
    |
    NULL
    {$$ = new Expr.Literal(treeID++, 'NULL', $1)}
;

type:
    INT
    {$$ = $1.toUpperCase()}
    |
    DOUBLE
    {$$ = $1.toUpperCase()}
    |
    DATE
    {$$ = $1.toUpperCase()}
    |
    VARCHAR
    {$$ = 'STRING'}
    |
    BOOLEAN
    {$$ = $1.toUpperCase()}
    |
    NULL
    {$$ = $1.toUpperCase()}
;

identifier:
    ID
    {$$ = $1.toLowerCase()}
;

string_literal:
    STRING_LITERAL
    {$$ = $1.slice(1,-1)}
;

%%

const Expr = require('../interpreter/Expression.cjs');
const Stmt = require('../interpreter/Statement.cjs');
var treeID = 0;
