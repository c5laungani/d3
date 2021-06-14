import {Runtime, Inspector} from "./runtime.js";
export default function define(runtime, observer) {
    const main = runtime.module();
    const fileAttachments = new Map([["data-formatted.json",new URL("./files/9b6806e3dd9c4c2c26760ba784437138c78b43a9a8e58a0bbafe5833026e3265637c9c7810224d66b79ba907b4d0be731c1a81ad043e10376aec3c18a49f3d84",import.meta.url)]]);
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
    main.variable(observer("chart")).define("chart", ["d3","width","height","chord","matrix","color","names","arc","outerRadius","ribbon"], function(d3,width,height,chord,matrix,color,names,arc,outerRadius,ribbon)
        {
            const svg = d3.create("svg")
                .attr("viewBox", [-width / 2, -height / 2, width, height])
                .attr("style", "background-color: white")
                .attr("width", "600")
                .attr("transform", "translate(400, 80)");

            const chords = chord(matrix);

            const group = svg.append("g")
                .attr("font-size", 10)
                .attr("font-family", "sans-serif")
                .selectAll("g")
                .data(chords.groups)
                .join("g");

            group.append("path")
                .attr("fill", d => color(names[d.index]))
                .attr("d", arc);

            group.append("text")
                .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
                .attr("dy", "0.35em")
                .attr("transform", d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 5})
        ${d.angle > Math.PI ? "rotate(180)" : ""}
      `)
                .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
                .text(d => names[d.index]);

            group.append("title")
                .text(d => `${names[d.index]}
${d3.sum(chords, c => (c.source.index === d.index) * c.source.value)} outgoing →
${d3.sum(chords, c => (c.target.index === d.index) * c.source.value)} incoming ←`);

            svg.append("g")
                .attr("fill-opacity", 0.75)
                .selectAll("path")
                .data(chords)
                .join("path")
                .style("mix-blend-mode", "multiply")
                .attr("fill", d => color(names[d.target.index]))
                .attr("d", ribbon)
                .append("title")
                .text(d => `${names[d.source.index]} → ${names[d.target.index]} ${d.source.value}`);

            return svg.node();
        }
    );
    main.variable().define("data", ["d3","FileAttachment","rename"], async function(d3,FileAttachment,rename){return(
        Array.from(d3.rollup((await FileAttachment("data-formatted.json").json())
                .flatMap(({name: source, imports}) => imports.map(target => [rename(source), rename(target)])),
            ({0: [source, target], length: value}) => ({source, target, value}), link => link.join())
            .values())
    )});
    main.variable().define("rename", function(){return(
        name => name.substring(name.indexOf(":") + 1, name.lastIndexOf(":"))
    )});
    main.variable().define("names", ["data","d3"], function(data,d3){return(
        Array.from(new Set(data.flatMap(d => [d.source, d.target]))).sort(d3.ascending)
    )});
    main.variable().define("matrix", ["names","data"], function(names,data)
        {
            const index = new Map(names.map((name, i) => [name, i]));
            const matrix = Array.from(index, () => new Array(names.length).fill(0));
            for (const {source, target, value} of data) matrix[index.get(source)][index.get(target)] += value;
            return matrix;
        }
    );
    main.variable().define("chord", ["d3","innerRadius"], function(d3,innerRadius){return(
        d3.chordDirected()
            .padAngle(10 / innerRadius)
            .sortSubgroups(d3.descending)
            .sortChords(d3.descending)
    )});
    main.variable().define("arc", ["d3","innerRadius","outerRadius"], function(d3,innerRadius,outerRadius){return(
        d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
    )});
    main.variable().define("ribbon", ["d3","innerRadius"], function(d3,innerRadius){return(
        d3.ribbonArrow()
            .radius(innerRadius - 1)
            .padAngle(1 / innerRadius)
    )});
    main.variable().define("color", ["d3","names"], function(d3,names){return(
        d3.scaleOrdinal(names, d3.quantize(d3.interpolateRainbow, names.length))
    )});
    main.variable().define("outerRadius", ["innerRadius"], function(innerRadius){return(
        innerRadius + 10
    )});
    main.variable().define("innerRadius", ["width","height"], function(width,height){return(
        Math.min(width, height) * 0.5 - 120
    )});
    main.variable().define("width", function(){return(
        800
    )});
    main.variable().define("height", ["width"], function(width){return(
        width
    )});
    main.variable().define("d3", ["require"], function(require){return(
        require("d3@6")
    )});
    return main;
}

const runtime = new Runtime();
const main = runtime.module(define, Inspector.into(document.body));
