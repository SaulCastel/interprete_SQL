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
;

stmts:
    stmts stmt ';'
    |
    stmt ';'
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
    |
    expr '-' expr
    |
    expr '*' expr
    |
    expr '/' expr
    |
    expr '%' expr
    |
    expr '=' expr
    |
    expr '!=' expr
    |
    expr '<' expr
    |
    expr '<=' expr
    |
    expr '>' expr
    |
    expr '>=' expr
    |
    expr AND expr
    |
    expr OR expr
    |
    '-' expr %prec UMINUS
    |
    NOT expr
    |
    '(' expr ')'
    |
    INT_LITERAL
    |
    DOUBLE_LITERAL
    |
    DATE_LITERAL
    |
    STRING_LITERAL
    |
    TRUE
    |
    FALSE
    |
    NULL
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
