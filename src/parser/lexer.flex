ID          [a-z][a-z0-9_-]*
NUM         [0-9]+
FLOAT       [0-9]+"."[0-9]+
STRING      ["][^"]*["]
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
{ID}                    return 'ID'
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
{NUM}                   return 'INT_LITERAL'
{FLOAT}                 return 'DOUBLE_LITERAL'
{STRING}                return 'STRING_LITERAL'
{DATE}                  return 'DATE_LITERAL'

<<EOF>>               return 'EOF'
.                     return 'INVALID'
