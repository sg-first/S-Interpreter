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


function e(list)
{
    var op;
    var val=[];
    
    for(var i=0;i<list.length;i++)
    {
        if(i==0)
        {
            op=list[0];
            continue;
        }

        //子表达式递归解析
        if(Array.isArray(list[i]))
        {
            val.push(e(list[i]));
            continue;
        }

        //变量直接转到值
        if(varlist[list[i]]!=undefined)
        {
            val.push(varlist[list[i]]);
            continue;
        }
        
        //其它视为字面量
        val.push(list[i]);
    }

    //跑函数表
    if(op=="define")
        return define(val[0],val[1]);

    //全部落空
    if(op=="+"||op=="-"||op=="*"||op=="/")
        return eval(val[0]+op+val[1]);
    else
    {
        //其它的就视为js函数吧
        var str=op+"(";
        for(var i=0;i<val.length;i++)
        {
            str+=val[i];
            if(i!=val.length-1)
                str+=",";
        }
        str+=")";
        return eval(str);
    }
}


function run(str) 
{
    var list=parser(str);
    for(var i in list)
        output(e(i));
}
