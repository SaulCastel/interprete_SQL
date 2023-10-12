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
    var_declaration
    |
    var_default
    |
    var_assignment
    |
    create_table
    |
    alter_table
    |
    drop_table
    |
    PRINT expr
    {$$ = new Stmt.Print(nodeId++, $2)}
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
;

var_declaration:
    DECLARE var_list
    {$$ = new Stmt.Declare(nodeId++, $2)}
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
    {$$ = new Stmt.DeclareDefault(nodeId++, $3, $4, $6)}
;

var_assignment:
    SET '@' identifier '=' expr
    {$$ = new Stmt.Set(nodeId++, $3, $5)}
;

create_table:
    CREATE TABLE identifier '(' col_declaration ')'
    {$$ = new Stmt.CreateTable(nodeId++, $3, $5)}
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
    {$$ = new Stmt.AlterTable(nodeId++, $3, $4)}
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
    {$$ = new Stmt.DropTable(nodeId++, $3)}
;

insert_into:
    INSERT INTO identifier '(' column_list ')'
    VALUES '(' value_list ')'
    {$$ = new Stmt.InsertInto(nodeId++, $3, $5, $9)}
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
    SELECT print_list
    {$$ = new Stmt.Select(nodeId++, $2)}
;

print_list:
    print_list ',' expr asign_alias
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

select_from:
    SELECT '*' FROM identifier where
    {$$ = new Stmt.SelectFrom(nodeId++, $4, $2, $5)}
    |
    SELECT selection FROM identifier where
    {$$ = new Stmt.SelectFrom(nodeId++, $4, $2, $5)}
;

selection:
    selection ',' identifier asign_alias
    {
        $$ = $1
        $$.push([$3, $4])
    }
    |
    identifier asign_alias
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
    {$$ = new Expr.Binary(nodeId++, $1, 'AND', $3)}
    |
    conditions OR condition
    {$$ = new Expr.Binary(nodeId++, $1, 'OR', $3)}
    |
    condition
;

condition:
    column_name '=' cond_expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    column_name '!=' cond_expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    column_name '<' cond_expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    column_name '<=' cond_expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    column_name '>' cond_expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    column_name '>=' cond_expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
;

column_name:
    identifier
    {$$ = new Expr.Identifier(nodeId++, $1)}
;

cond_expr:
    cond_expr '+' cond_expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    cond_expr '-' cond_expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    cond_expr '*' cond_expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    cond_expr '/' cond_expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    cond_expr '%' cond_expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    '-' cond_expr %prec UMINUS
    {$$ = new Expr.Unary(nodeId++, $1, $2)}
    |
    '(' cond_expr ')'
    {$$ = new Expr.Group(nodeId++, $2)}
    |
    literal
    |
    '@' identifier
    {$$ = new Expr.Variable(nodeId++, $2)}
;

update:
    UPDATE identifier SET update_list where
;

update_list:
    update_list ',' identifier '=' expr
    |
    identifier '=' expr
;

truncate:
    TRUNCATE TABLE identifier
;

delete_from:
    DELETE FROM identifier where
;

expr:
    expr '+' expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    expr '-' expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    expr '*' expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    expr '/' expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    expr '%' expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    expr '=' expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    expr '!=' expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    expr '<' expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    expr '<=' expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    expr '>' expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    expr '>=' expr
    {$$ = new Expr.Binary(nodeId++, $1, $2, $3)}
    |
    expr AND expr
    {$$ = new Expr.Binary(nodeId++, $1, 'AND', $3)}
    |
    expr OR expr
    {$$ = new Expr.Binary(nodeId++, $1, 'OR', $3)}
    |
    '-' expr %prec UMINUS
    {$$ = new Expr.Unary(nodeId++, $1, $2)}
    |
    NOT expr
    {$$ = new Expr.Unary(nodeId++, 'NOT', $2)}
    |
    '(' expr ')'
    {$$ = new Expr.Group(nodeId++, $2)}
    |
    literal
    |
    '@' identifier
    {$$ = new Expr.Variable(nodeId++, $2)}
;

literal:
    INT_LITERAL
    {$$ = new Expr.Literal(nodeId++, 'INT', $1)}
    |
    DOUBLE_LITERAL
    {$$ = new Expr.Literal(nodeId++, 'DOUBLE', $1)}
    |
    DATE_LITERAL
    {$$ = new Expr.Literal(nodeId++, 'DATE', $1)}
    |
    string_literal
    {$$ = new Expr.Literal(nodeId++, 'STRING', $1)}
    |
    TRUE
    {$$ = new Expr.Literal(nodeId++, 'TRUE', $1)}
    |
    FALSE
    {$$ = new Expr.Literal(nodeId++, 'FALSE', $1)}
    |
    NULL
    {$$ = new Expr.Literal(nodeId++, 'NULL', $1)}
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
    {$$ = $1.toUpperCase()}
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
var nodeId = 0;
