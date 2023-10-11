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
    SELECT select_list
    {$$ = new Stmt.Select(nodeId++, $2)}
;

select_from:
    SELECT '*' FROM identifier where
    {$$ = new Stmt.SelectFrom(nodeId++, $4, $2, $5)}
    |
    SELECT select_list FROM identifier where
    {$$ = new Stmt.SelectFrom(nodeId++, $4, $2, $5)}
;

where:
    WHERE expr
    {$$ = $2}
    |
    /* epsilon */
;

select_list:
    select_list ',' select_item
    {
        $$ = $1
        $$.push($3)
    }
    |
    select_item
    {
        $$ = []
        $$.push($1)
    }
;

select_item:
    select_option asign_alias
    {
        $$ = [$1, $2]
    }
;

select_opion:
    '@' identifier
    {$$ = new Expr.Variable(nodeId++, $2)}
    |
    identifier
;

asign_alias:
    AS identifer
    {$$ = $2}
    |
    AS STRING_LITERAL
    {$$ = $2}
    |
    /* epsilon */
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
    INT_LITERAL
    {$$ = new Expr.Literal(nodeId++, 'INT', $1)}
    |
    DOUBLE_LITERAL
    {$$ = new Expr.Literal(nodeId++, 'DOUBLE', $1)}
    |
    DATE_LITERAL
    {$$ = new Expr.Literal(nodeId++, 'DATE', $1)}
    |
    STRING_LITERAL
    {$$ = new Expr.Literal(nodeId++, 'STRING', $1.slice(1,-1))}
    |
    TRUE
    {$$ = new Expr.Literal(nodeId++, 'TRUE', $1)}
    |
    FALSE
    {$$ = new Expr.Literal(nodeId++, 'FALSE', $1)}
    |
    NULL
    {$$ = new Expr.Literal(nodeId++, 'NULL', $1)}
    |
    '@' identifier
    {$$ = new Expr.Variable(nodeId++, $2)}
    |
    identifier
    /* No se crea un nodo porque este ID solo se usa en WHERE */
;

type:
    INT
    |
    DOUBLE
    |
    DATE
    |
    VARCHAR
    |
    BOOLEAN
    |
    NULL
;

identifier:
    ID
    {$$ = $1.toLowerCase()}
;

%%

const Expr = require('../interpreter/Expression.cjs');
const Stmt = require('../interpreter/Statement.cjs');
var nodeId = 0;
