const render = (template, data) => {
    const tagPattern = /<(\w+)\s+([^>]+)((\/>)|([^<]+<\/(\1)>))/m;
    const fragmentPattern = /##([0-9a-f]+)##/i;
    const directiveVIFPattern = /v-if="([0-9a-z.]+)"/i;
    const dataPlaceholderPattern = /{{([0-9a-z.]+)}}/g;

    const matchedFragment = {};

    const makeRandomName = () => Math.floor((new Date().getTime()) * Math.random()).toString(16);

    const readData = (data, expression) => {
        let finalData = data;
        let expressionPart = expression.split('.');

        while (expressionPart.length) {
            finalData = finalData[expressionPart.shift()];
        }

        return finalData;
    }


    while (template.match(tagPattern)) {
        template = template.replace(tagPattern, (match) => {
            matchedFragmentName = makeRandomName();
            matchedFragment[matchedFragmentName] = match;
            return '##' + matchedFragmentName + '##';
        })
    }

    while (template.match(fragmentPattern)) {
        template = template.replace(fragmentPattern, (match, group1) => {
            const fragment = matchedFragment[group1];

            if (fragment) {
                const matched = fragment.match(tagPattern);

                // check attribute directive
                const directiveVIF = matched[2].match(directiveVIFPattern);
                if (directiveVIF) {
                    if (!readData(data, directiveVIF[1])) {
                        return fragment.replace(tagPattern, '<!--v-if:false-->');
                    }
                }

                return fragment.replace(dataPlaceholderPattern, (match, group1) => readData(data, group1));
            }

            throw new Error('BAD Template, Fragment NOT Found!');
        })
    }

    return template;
}

let tmpl = `<div class="newslist">
<div class="img" v-if="info.showImage"><img src="{{image}}"/></div>
<div class="date" v-if="info.showDate">{{info.name}}</div>
<div class="img">{{info.name}}</div>
</div>`;

const output = render(tmpl, {
image: "some img", 
info: {showImage: true, showDate:false, name: "aaa"}
});

console.log(output);
