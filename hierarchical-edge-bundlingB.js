import {Runtime, Inspector} from "./runtime.js";
export default function define(runtime, observer) {
    const main = runtime.module();
    //const fileName = './flare.json'
    const fileName = './data-formatted.json'
    //const globalDelimiter = "."
    const globalDelimiter = ":"
    const fileAttachments = new Map([[fileName,new URL("./files/9b6806e3dd9c4c2c26760ba784437138c78b43a9a8e58a0bbafe5833026e3265637c9c7810224d66b79ba907b4d0be731c1a81ad043e10376aec3c18a49f3d84",import.meta.url)]]);
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
   // main.variable(observer()).define(["md","colorout","colorin"], function(md,colorout,colorin){return(
    //    md`# Hierarchical Edge Bundling
//This chart shows relationships between different types of employees at Enron in a hierarchy. Hover over an email to reveal the persons this employee sent an email to. (<b style="color: ${colorout};">outgoing</b> edges).`
   // )});
    main.variable(observer("chart")).define("chart", ["tree","bilink","d3","data","width","id","colornone","line","colorin","colorout"], function(tree,bilink,d3,data,width,id,colornone,line,colorin,colorout)
        {
            const root = tree(bilink(d3.hierarchy(data)
                .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

            const svg = d3.create("svg")
                .attr("viewBox", [-width / 2, -width / 2, width, width])
                .attr("style", "background-color: white")
                .attr("width", "1000")
                .attr("transform", "translate(400, 80)");
                

            let jobList = [];
            var selectionCEO = [];
            var amount = 0

            const node = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .selectAll("g")
                .data(root.leaves())
                .join("g")
                .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
                .append("text")
                .attr("dy", ".31em")
                .attr("x", d => d.x < Math.PI ? 6 : -6)
                .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
                .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
                .text(d => d.data.name)
                .each(function(d) { d.text = this; })
                .on("mouseover", overed)
                .on("mouseout", outed)
                .call(text => text.append("title").text(d => `${id(d)}
${d.outgoing.length} sent to List`))

            //Adding the jobFunction label to each group
            svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 13)
                .attr("font-weight", 700)
                .selectAll("g")
                .data(root.leaves())
                .join("g")
                .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
                .append("text")
                .attr("dy", "0.6em")
                .attr("x", d => d.x < Math.PI ? 150 : -150)
                .attr("y", 0)
                .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
                .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
                .text(function(d) {
                    jobList.push(d.data.jobFunction)
                    jobList = [...new Set(jobList)]
                    for (var i = 0; i < jobList.length; i++ ) {
                        if (d.data.jobFunction == jobList[i]) {
                            if (amount > 0){
                                return ""
                            }
                            else{
                                if (amount == 0 & d.data.jobFunction == "CEO"){
                                    amount =+ 1
                                    return d.data.jobFunction

                                }
                                else if (amount == 1){
                                    amount =+1
                                    return d.data.jobFunction
                                }
                                else if (amount > 1){
                                    return ""
                                } }


                        }
                        else {
                            jobList.shift()
                            amount = 0
                            return d.data.jobFunction}}});


            svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 13)
                .attr("font-weight", 700)
                .selectAll("g")
                .data(root.leaves())
                .join("g")
                .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
                .append("text")
                .attr("dy", "0.6em")
                .attr("x", d => d.x < Math.PI ? 150 : -150)
                .attr("y", 0)
                .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
                .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
                .text(function(d) {
                    jobList.push(d.data.jobFunction)
                    jobList = [...new Set(jobList)]
                    for (var i = 0; i < jobList.length; i++ ) {
                        if (d.data.jobFunction == "CEO") {
                               
                            return d.data.jobFunction}}})
                .on("mouseover", overedLabel);

            const link = svg.append("g")
                .attr("stroke", colornone)
                .attr("fill", "none")
                .selectAll("path")
                .data(root.leaves().flatMap(leaf => leaf.outgoing))
                .join("path")
                .style("mix-blend-mode", "multiply")
                .attr("d", ([i, o]) => line(i.path(o)))
                .each(function(d) { d.path = this; });


            function overed(event, d) {
                link.style("mix-blend-mode", null);
                d3.select(this).attr("font-weight", "bold");
                d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorout).raise();
                d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", colorout).attr("font-weight", "bold");
            }

            function outed(event, d) {
                link.style("mix-blend-mode", "multiply");
                d3.select(this).attr("font-weight", null);
                d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
                d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);
            }

            function overedLabel(event, d) {
                link.style("mix-blend-mode", null);
                d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorout).raise();
                d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", colorout).attr("font-weight", "bold");
            }
               
            }

            return svg.node();
        }
    );
    main.variable(observer("data")).define("data", ["hierarchy","FileAttachment"], async function(hierarchy,FileAttachment){return(
        hierarchy(await FileAttachment(fileName).json())
    )});
    main.variable(observer("hierarchy")).define("hierarchy", function(){return(
        function hierarchy(data, delimiter = globalDelimiter) {
            let root;
            const map = new Map;
            data.forEach(function find(data) {
                const {name} = data;
                if (map.has(name)) return map.get(name);
                const i = name.lastIndexOf(delimiter);
                const j = name.lastIndexOf("flare:") //To get the Job function from the data
                map.set(name, data);
                if (i >= 0) {
                    find({name: name.substring(0, i), children: []}).children.push(data);
                    data.name = name.substring(i + 1);
                    data.jobFunction = name.substring(j + 6, i); //Cut out the Job function from the "flare:..." string in data-formatted
                } else {
                    root = data;
                }
                return data;
            });

            return root;
        }
    )});
    main.variable(observer("bilink")).define("bilink", ["id"], function(id){return(
        function bilink(root) {
            const map = new Map(root.leaves().map(d => {
                return [id(d), d]
            }))
            for (const d of root.leaves()) {
                d.incoming = []
                d.outgoing = d.data.imports.map(i => {
                    return [d, map.get(i)]
                });
            }

            for (const d of root.leaves()) {
                for (const o of d.outgoing) {
                    o[1].incoming.push(o);
                }
            }
            return root;
        }
    )});
    main.variable(observer("id")).define("id", function(){return(
        function id(node) {
            return `${node.parent ? id(node.parent) + globalDelimiter : ""}${node.data.name}`;
        }
    )});
    main.variable(observer("colorin")).define("colorin", function(){return(
        "#00f"
    )});
    main.variable(observer("colorout")).define("colorout", function(){return(
        "#4287f5" //write function depending on sentiment
    )});
    main.variable(observer("colornone")).define("colornone", function(){return(
        "#ccc"
    )});
    main.variable(observer("width")).define("width", function(){return(
        1000
    )});
    main.variable(observer("radius")).define("radius", ["width"], function(width){return(
        width / 3.25
    )});
    main.variable(observer("line")).define("line", ["d3"], function(d3){return(
        d3.lineRadial()
            .curve(d3.curveBundle.beta(0.85))
            .radius(d => d.y)
            .angle(d => d.x)
    )});
    main.variable(observer("tree")).define("tree", ["d3","radius"], function(d3,radius){return(
        d3.cluster()
            .size([2 * Math.PI, radius - 100])
    )});
    main.variable(observer("d3")).define("d3", ["require"], function(require){return(
        require("d3@6")
    )});
    return main;
}

const runtime = new Runtime();
const main = runtime.module(define, Inspector.into(document.body));

