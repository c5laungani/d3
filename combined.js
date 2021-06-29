import {Runtime, Inspector} from "./runtime.js";
export default function define(runtime, observer) {
    var dispatch = d3.dispatch("highlightedNode");
    const main = runtime.module();
    const main2 = runtime.module();
    const fileAttachments = new Map([["data-formatted.json", new URL("./files/9b6806e3dd9c4c2c26760ba784437138c78b43a9a8e58a0bbafe5833026e3265637c9c7810224d66b79ba907b4d0be731c1a81ad043e10376aec3c18a49f3d84", import.meta.url)]]);
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
    main.variable(observer("chart")).define("chart", ["d3", "width", "height", "chord", "matrix", "color", "names", "arc", "outerRadius", "ribbon"], function (d3, width, height, chord, matrix, color, names, arc, outerRadius, ribbon) {


            const svg = d3.create("svg")
                .attr("viewBox", [-width / 2, -height / 2, width, height])
                .attr("style", "background-color: white")
                .attr("width", "600")
                .attr("id", "#chord_dep_diag")
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


            function brushended(event) {
                var s = event.selection;


                if(!s)
                {
                    dispatch.call("highlightedNode", null, null);
                    return;
                }
                var x = [s[0][0], s[1][0]];
                var y = [s[0][1], s[1][1]];

                function findAngle(y,x) {
                    var actualAngle = 0;
                    var refAngle = Math.atan(y/x)
                    if ( x <= 0 && y <= 0 ) {
                        actualAngle = 4.71 + refAngle;
                        return actualAngle;
                    }
                    else if (x <= 0 && y >= 0 ) {
                        actualAngle = 4.71 + refAngle;
                        return actualAngle;
                    }
                    else if (x >= 0 && y >= 0 ) {
                        actualAngle = 1.57 + refAngle;
                        return actualAngle;
                    }
                    else if (x >= 0 && y <= 0) {
                        actualAngle = 1.57 + refAngle;
                        return actualAngle;
                    }
                    else {
                        return -1;
                    }

                }


                var angle = findAngle(y[1],x[1]);



                var nodes = Object.values(chords.groups);


                var selectedNode = {} ;
                nodes.forEach(function(node)
                {

                    if(angle >=node["startAngle"] && angle <=node["endAngle"])
                    {
                        selectedNode = node;

                    }
                });


                console.log("Select node is : ", names[selectedNode["index"]])
                dispatch.call("highlightedNode", null,{selectedNode:selectedNode,names:names});
            }


            const brush = d3.brush().on("end", brushended);
            svg.append("g")
                .call(brush);

            return svg.node();
        }
    );


    main.variable().define("data", ["d3", "FileAttachment", "rename"], async function (d3, FileAttachment, rename) {
        return (
            Array.from(d3.rollup((await FileAttachment("data-formatted.json").json())
                    .flatMap(({name: source, imports}) => imports.map(target => [rename(source), rename(target)])),
                ({0: [source, target], length: value}) => ({source, target, value}), link => link.join())
                .values())
        )
    });
    main.variable().define("rename", function () {
        return (
            name => name.substring(name.indexOf(":") + 1, name.lastIndexOf(":"))
        )
    });
    main.variable().define("names", ["data", "d3"], function (data, d3) {
        return (
            Array.from(new Set(data.flatMap(d => [d.source, d.target]))).sort(d3.ascending)
        )
    });
    main.variable().define("matrix", ["names", "data"], function (names, data) {
            const index = new Map(names.map((name, i) => [name, i]));
            const matrix = Array.from(index, () => new Array(names.length).fill(0));
            for (const {source, target, value} of data) matrix[index.get(source)][index.get(target)] += value;
            return matrix;
        }
    );
    main.variable().define("chord", ["d3", "innerRadius"], function (d3, innerRadius) {
        return (
            d3.chordDirected()
                .padAngle(10 / innerRadius)
                .sortSubgroups(d3.descending)
                .sortChords(d3.descending)
        )
    });
    main.variable().define("arc", ["d3", "innerRadius", "outerRadius"], function (d3, innerRadius, outerRadius) {
        return (
            d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius)
        )
    });
    main.variable().define("ribbon", ["d3", "innerRadius"], function (d3, innerRadius) {
        return (
            d3.ribbonArrow()
                .radius(innerRadius - 1)
                .padAngle(1 / innerRadius)
        )
    });


    main.variable().define("color", ["d3", "names"], function (d3, names) {
        return (
            d3.scaleOrdinal(names, d3.quantize(d3.interpolateRainbow, names.length))
        )
    });
    main.variable().define("outerRadius", ["innerRadius"], function (innerRadius) {
        return (
            innerRadius + 10
        )
    });
    main.variable().define("innerRadius", ["width", "height"], function (width, height) {
        return (
            Math.min(width, height) * 0.5 - 120
        )
    });
    main.variable().define("width", function () {
        return (
            800
        )
    });
    main.variable().define("height", ["width"], function (width) {
        return (
            width
        )
    });
    main.variable().define("d3", ["require"], function (require) {
        return (
            require("d3@6")
        )
    });


    const globalDelimiter = ":"

    main2.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));

    main2.variable().define("names", ["data", "d3"], function (data, d3) {
        return (
            Array.from(new Set(data.flatMap(d => [d.source, d.target]))).sort(d3.ascending)
        )
    });

    main2.variable(observer("chart")).define("chart", ["tree", "bilink", "d3", "data", "width", "id", "colornone", "line", "colorin", "colorout"], function (tree, bilink, d3, data, width, id, colornone, line, colorin, colorout) {
            const root = tree(bilink(d3.hierarchy(data)
                .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

            const svg = d3.create("svg")
                .attr("viewBox", [-width / 2, -width / 2, width, width])
                .attr("style", "background-color: white")
                .attr("width", "600")
                .attr("transform", "translate(400, 80)");


            let jobList = [];
            var allJobFunctions = [];
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
                .each(function (d) {
                    d.text = this;
                })
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
                .text(function (d) {
                    jobList.push(d.data.jobFunction)
                    allJobFunctions.push(d.data.jobFunction)
                    jobList = [...new Set(jobList)]
                    for (var i = 0; i < jobList.length; i++) {
                        if (d.data.jobFunction == jobList[i]) {
                            if (amount > 0) {
                                return ""
                            } else {
                                if (amount == 0 & d.data.jobFunction == "CEO") {
                                    amount = +1
                                    return d.data.jobFunction

                                } else if (amount == 1) {
                                    amount = +1
                                    return d.data.jobFunction
                                } else if (amount > 1) {
                                    return ""
                                }
                            }


                        } else {
                            jobList.shift()
                            amount = 0
                            return d.data.jobFunction
                        }
                    }
                })
                .on("mouseover", overedLabel)
                .on("mouseout", outedLabel);

            const link = svg.append("g")
                .attr("stroke", colornone)
                .attr("fill", "none")
                .selectAll("path")
                .data(root.leaves().flatMap(leaf => leaf.outgoing))
                .join("path")
                .style("mix-blend-mode", "multiply")
                .attr("d", ([i, o]) => line(i.path(o)))
                .each(function (d) {
                    d.path = this;
                });


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


            //When hovering over a group label, this function is executed
            function overedLabel(event, k) {
                d3.select(this)
                    .attr("font-size", 23)
                link.style("mix-blend-mode", null)
                d3.selectAll(node)
                    .each(function (d, i) {
                        var colorGroup = "OrangeRed"
                        if (d.data.jobFunction == k.data.jobFunction) {
                            d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorGroup).raise();  //Highlight all outgoing paths from all employees with this job type
                            d3.selectAll(d.incoming.map(([, d]) => d.text)).attr("font-weight", "bold");
                        }

                    })


            }


            function overedLabel2(event, k) {
                d3.select(this)
                    .attr("font-size", 23)
                link.style("mix-blend-mode", null)
                d3.selectAll(node)
                    .each(function (d, i) {
                        var colorGroup = "OrangeRed"
                        if (d.data.jobFunction == k) {
                            d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorGroup).raise();  //Highlight all outgoing paths from all employees with this job type
                            d3.selectAll(d.incoming.map(([, d]) => d.text)).attr("font-weight", "bold");
                        }

                    })


            }


            //When the mouse stops hovering over a group label, this function is executed
            function outedLabel(event, k) {
                d3.select(this)
                    .attr("font-size", 13)
                link.style("mix-blend-mode", "multiply")
                d3.selectAll(node)
                    .each(function (d, i) {
                        console.log(k.data.jobFunction)
                        if (d.data.jobFunction == k.data.jobFunction)
                            d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null).raise();
                        d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);
                    })

            }

        function clearAlLabels(event) {
            d3.select(this)
                .attr("font-size", 13)
            link.style("mix-blend-mode", "multiply")
            d3.selectAll(node)
                .each(function (d, i) {

                        d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null).raise();
                })

        }


            dispatch.on("highlightedNode", function(data) {

                let names = data["names"]
                clearAlLabels(d3)
                let selectedNode = data["selectedNode"]
                overedLabel2(d3,names[selectedNode["index"]])


            })


            return svg.node();
        }
    );
    main2.variable().define("data", ["hierarchy", "FileAttachment"], async function (hierarchy, FileAttachment) {
        return (
            hierarchy(await FileAttachment("data-formatted.json").json())
        )
    });
    main2.variable().define("hierarchy", function () {
        return (
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
        )
    });
    main2.variable().define("bilink", ["id"], function (id) {
        return (
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
        )
    });
    main2.variable().define("id", function () {
        return (
            function id(node) {
                return `${node.parent ? id(node.parent) + globalDelimiter : ""}${node.data.name}`;
            }
        )
    });
    main2.variable().define("colorin", function () {
        return (
            "#00f"
        )
    });
    main2.variable().define("colorout", function () {
        return (
            "#4287f5" //write function depending on sentiment
        )
    });
    main2.variable().define("colornone", function () {
        return (
            "#ccc"
        )
    });
    main2.variable().define("width", function () {
        return (
            1000
        )
    });
    main2.variable().define("radius", ["width"], function (width) {
        return (
            width / 3.25
        )
    });
    main2.variable().define("line", ["d3"], function (d3) {
        return (
            d3.lineRadial()
                .curve(d3.curveBundle.beta(0.85))
                .radius(d => d.y)
                .angle(d => d.x)
        )
    });
    main2.variable().define("tree", ["d3", "radius"], function (d3, radius) {
        return (
            d3.cluster()
                .size([2 * Math.PI, radius - 100])
        )
    });
    main2.variable().define("d3", ["require"], function (require) {
        return (
            require("d3@6")
        )
    });



    return main,main2;
}

const runtime = new Runtime();
const main = runtime.module(define, Inspector.into(document.body));
const main2 = runtime.module(define, Inspector.into(document.body));

