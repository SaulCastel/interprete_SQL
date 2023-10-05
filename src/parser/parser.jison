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
    expr -> $$ = $1
;

var_declaration:
    DECLARE var_list
;

var_list:
    var_list ',' '@' ID type
    |
    '@' ID type
;

var_default:
    DECLARE '@' ID type DEFAULT expr
;

var_assignment:
    SET '@' ID '=' expr
;

create_table:
    CREATE TABLE ID '(' column_list ')'
;

column_list:
    column_list ',' ID type
    ID type
;

alter_table:
    ALTER TABLE ID alter_action
;

alter_action:
    ADD ID type
    |
    DROP COLUMN ID
    |
    RENAME TO ID
    |
    RENAME COLUMN ID TO ID
;

drop_table:
    DROP TABLE ID
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
    {$$ = new Expr.Binary(nodeId++, $1, $2.toUpperCase(), $3)}
    |
    expr OR expr
    {$$ = new Expr.Binary(nodeId++, $1, $2.toUpperCase(), $3)}
    |
    '-' expr %prec UMINUS
    {$$ = new Expr.Unary(nodeId++, $1, $2)}
    |
    NOT expr
    {$$ = new Expr.Unary(nodeId++, $1.toUpperCase(), $2)}
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
    {$$ = new Expr.Literal(nodeId++, 'VARCHAR', $1)}
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

%%

const Expr = require('../interpreter/Expression.js');
var nodeId = 0;
