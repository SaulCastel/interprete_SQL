function escapeStr(str){
    return str.replaceAll('\\"', '"')
        .replaceAll('\\n', '\n')
        .replaceAll('\\t', '\t')
        .replaceAll("\\'", '\'')
        .replaceAll("\\\\", '\\')
}

module.exports = escapeStr
