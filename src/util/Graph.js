function genDOT(stmts){
    let dot = 'graph AST {\n'
    dot += '\tordering=out\n'
    dot += '\tnode[shape=plaintext]\n'
    dot += stmts[0]._genDOT()
    dot += '\t"code0"[label="Code"]\n'
    dot += `\t"code0" -- "stmt${stmts[0].id}"\n`
    for (let i=1; i < stmts.length; i++){
        dot += `\t"code${i-1}" -- "stmt${stmts[i].id}"\n`
        dot += stmts[i]._genDOT()
        dot += `\t"code${i}"[label="Code"]\n`
        dot += `\t"code${i}" -- "code${i-1}"\n`
    }
    dot += `\t"code${stmts.length - 1}" -- "EOF"\n`
    dot += '}'
    return dot
}

module.exports = genDOT
