%x comment
%options flex case-insensitive

%%

\s+                                                         /* no hacer nada */
"--".*                                                      /* no hacer nada */

"/*"                                                        this.pushState('comment');
<comment>"*/"                                               this.popState();
<comment>[^\n]+                                             /* no hacer nada */
<comment>\n                                                 /* no hacer nada */

"true"                                                      return 'TRUE'
"false"                                                     return 'FALSE'
"declare"                                                   return 'DECLARE'
"default"                                                   return 'DEFAULT'
"set"                                                       return 'SET'
"create"                                                    return 'CREATE'
"table"                                                     return 'TABLE'
"alter"                                                     return 'ALTER'
"table"                                                     return 'TABLE'
"add"                                                       return 'ADD'
"drop"                                                      return 'DROP'
"rename"                                                    return 'RENAME'
"column"                                                    return 'COLUMN'
"to"                                                        return 'TO'
"and"                                                       return 'AND'
"or"                                                        return 'OR'
"not"                                                       return 'NOT'
"int"                                                       return 'INT'
"double"                                                    return 'DOUBLE'
"date"                                                      return 'DATE'
"varchar"                                                   return 'VARCHAR'
"boolean"                                                   return 'BOOLEAN'
"null"                                                      return 'NULL'
"print"                                                     return 'PRINT'
"insert"                                                    return 'INSERT'
"into"                                                      return 'INTO'
"values"                                                    return 'VALUES'
"select"                                                    return 'SELECT'
"from"                                                      return 'FROM'
"where"                                                     return 'WHERE'
"as"                                                        return 'AS'
"update"                                                    return 'UPDATE'
"truncate"                                                  return 'TRUNCATE'
"delete"                                                    return 'DELETE'
"cast"                                                      return 'CAST'
"begin"                                                     return 'BEGIN'
"end"                                                       return 'END'
"for"                                                       return 'FOR'
"in"                                                        return 'IN'
"while"                                                     return 'WHILE'
"break"                                                     return 'BREAK'
"continue"                                                  return 'CONTINUE'
".."                                                        return '..'
";"                                                         return ';'
"@"                                                         return '@'
","                                                         return ','
"("                                                         return '('
")"                                                         return ')'
"+"                                                         return '+'
"-"                                                         return '-'
"*"                                                         return '*'
"/"                                                         return '/'
"%"                                                         return '%'
"="                                                         return '='
">"                                                         return '>'
">="                                                        return '>='
"<"                                                         return '<'
"<="                                                        return '<='
"!="                                                        return '!='
(19|20)\d\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])    return 'DATE_LITERAL'
[0-9]+"."[0-9]+                                             return 'DOUBLE_LITERAL'
[0-9]+                                                      return 'INT_LITERAL'
\"(\\.|[^"\\])*\"                                           return 'STRING_LITERAL'
[a-z][a-z0-9_-]*                                            return 'ID'

<<EOF>>                                                     return 'EOF'
.                                                           return 'INVALID'

%%
/*
    Regex para string con caracteres de escape
    - https://stackoverflow.com/questions/2039795/regular-expression-for-a-string-literal-in-flex-lex

    Regex para comentario multilinea
    - https://westes.github.io/flex/manual/How-can-I-match-C_002dstyle-comments_003f.html
    - https://gerhobbelt.github.io/jison/docs/#lexical-analysis

    Regex para fecha
    - https://www.regular-expressions.info/dates.html
*/
