#require "lib.js"

function parser(src)
{
    src += '\n';
    var pstr = "";
    var state = 0;
    for(var i=0;i<src.length;i++)
    {
        if(src[i]=="\"")
        {
            switch(state)
            {
                case 0: state = 1; break;
                case 1: state = 0; break;
            }
        }
        else if(src[i] == ";")
        {
            if(state == 0)
            {
                for(i++; i < src.length && src[i] != '\n'; )
                    i++;
            }
        }
        pstr += src[i];
    }
    pstr = pstr.substring(0, pstr.length-1);

    function getTokens(splits)
    {
        var tokens = [], part, s;
        for(var i = 0; i < splits.length; i++)
        {
            part = splits[i];
            if(part && part.trim())
            {
                tokens.push(part);
            }
        }
        return tokens;
    }
    var tokens = getTokens(pstr.split(/(".*")|(\s+)|([\(\)\[\]]{1})/g));
    tokens = tokens.map(function(t) {
        if(t == '(' || t == '[')
            return '[';
        else if(t == ')' || t == ']')
            return ']';
        else
        {
            t = t.replace(/'/g, "\\'");
            if(t[0] == "#" && t[1] == "\\")
                return "'" + t[0] + "\\" + t.substring(1) + "'";
            else if(t[0] == "\"")
                return "'\"" + t.substring(1) + "'";
            else if(t[0] == "'")
                return "\"\\'" + t.substring(1) + "\"";

            return "'" + t + "'";
        }
    }).join(',');
    var arrayExp = "[" + tokens.replace(/\[,/g,'[').replace(/,\]/g,']') + "]";
    return eval(arrayExp);
}