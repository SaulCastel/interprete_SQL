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
;

var_declaration:
    DECLARE var_list
    {$$ = new Stmt.Declare(nodeId++, $2)}
;

var_list:
    var_list ',' '@' ID type
    {
        $$ = $1
        $$.push([$4, $5])
    }
    |
    '@' ID type
    {
        $$ = []
        $$.push([$2, $3])
    }
;

var_default:
    DECLARE '@' ID type DEFAULT expr
    {$$ = new Stmt.DeclareDefault(nodeId++, $3, $4, $6)}
;

var_assignment:
    SET '@' ID '=' expr
    {$$ = new Stmt.Set(nodeId++, $3, $5)}
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
    '@' ID
    {$$ = new Expr.Identifier(nodeId++, $2)}
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

const Expr = require('../interpreter/Expression.cjs');
const Stmt = require('../interpreter/Statement.cjs');
var nodeId = 0;
