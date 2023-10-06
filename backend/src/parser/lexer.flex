ID          [a-z][a-z0-9_-]*
NUM         [0-9]+
FLOAT       [0-9]+"."[0-9]+
/*
    Regex para string con caracteres de escape
    - https://stackoverflow.com/questions/2039795/regular-expression-for-a-string-literal-in-flex-lex
*/
STRING      \"(\\.|[^"\\])*\"
SCOMMENT    "--".*
DATE        [0-9]{4}"-"("10"|[0-1][1-9])"-"("30"|"31"|"10"|"20"[0-2][1-9])

%x comment
%options flex case-insensitive

%%

\s+                     /* no hacer nada */
{SCOMMENT}              /* no hacer nada */

/*
    comentario multilinea
    - https://westes.github.io/flex/manual/How-can-I-match-C_002dstyle-comments_003f.html
    - https://gerhobbelt.github.io/jison/docs/#lexical-analysis
*/
"/*"                    this.pushState('comment');
<comment>"*/"           this.popState();
<comment>[^\n]+         /* no hacer nada */
<comment>\n             /* no hacer nada */

"true"                  return 'TRUE'
"false"                 return 'FALSE'
"declare"               return 'DECLARE'
"default"               return 'DEFAULT'
"set"                   return 'SET'
"create"                return 'CREATE'
"table"                 return 'TABLE'
"alter"                 return 'ALTER'
"table"                 return 'TABLE'
"add"                   return 'ADD'
"drop"                  return 'DROP'
"rename"                return 'RENAME'
"column"                return 'COLUMN'
"to"                    return 'TO'
"and"                   return 'AND'
"or"                    return 'OR'
"not"                   return 'NOT'
"int"                   return 'INT'
"double"                return 'DOUBLE'
"date"                  return 'DATE'
"varchar"               return 'VARCHAR'
"boolean"               return 'BOOLEAN'
"null"                  return 'NULL'
"print"                 return 'PRINT'
";"                     return ';'
"@"                     return '@'
","                     return ','
"("                     return '('
")"                     return ')'
"+"                     return '+'
"-"                     return '-'
"*"                     return '*'
"/"                     return '/'
"%"                     return '%'
"="                     return '='
">"                     return '>'
">="                    return '>='
"<"                     return '<'
"<="                    return '<='
"!="                    return '!='
{FLOAT}                 return 'DOUBLE_LITERAL'
{NUM}                   return 'INT_LITERAL'
{STRING}                return 'STRING_LITERAL'
{DATE}                  return 'DATE_LITERAL'
{ID}                    return 'ID'

<<EOF>>               return 'EOF'
.                     return 'INVALID'
