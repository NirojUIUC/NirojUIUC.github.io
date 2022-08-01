async function init(evt) {
    await createTop15CountryWiseSummaryBars();
    await createIndustryCategoryTable();
    await addYearsOptions();
    await createPieDigramForIndustryTypes();
    await createScatterPlotForYearsTreds(1982, 2020);
    await annotationDetails();
    await annotationDetailsScatterPlot();
}

async function createTop15CountryWiseSummaryBars() {
    var all_cntry_list = await d3.csv('data/company_dataset_list.csv');
    all_cntry_list = all_cntry_list.sort((a, b) =>
        d3.descending(+a.tot, +b.tot)).filter((d, i) => i <= 15)

    const margin = { top: 20, right: 30, bottom: 40, left: 120 },
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    total_comp = all_cntry_list.map((d, i) => +d.tot);
    max_total = d3.max(total_comp);

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    const svg = d3.select("#horizontal-bars")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, max_total])
        .range([0, width]);

    // Y axis
    const y = d3.scaleBand()
        .range([0, height])
        .domain(all_cntry_list
            .map((d, i) => d.country.toUpperCase())
        )
        .padding(.2);

    const ys = d3.scaleBand()
        .range([0, height])
        .domain(all_cntry_list
            .map((d, i) => d.country)
        )
        .padding(.2);


    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    var tooltip = d3.select("#summary_bars")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    //Bars
    svg.selectAll()
        .data(all_cntry_list)
        .enter()
        .append("rect")
        .attr("x", x(0))
        .attr("y", d => ys(d.country))
        .attr("width", 0)
        .attr("height", y.bandwidth())
        .attr("fill", (d, i) => color(i))
        .on("mouseover", function (event, d) {
            // console.log(`Country: ${d.country.toUpperCase()}
            // Total Companies: ${d.tot}`)
            tooltip.style("opacity", 1)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px")
                .style("stroke-width", 4)
                .html(`Country: ${d.country.toUpperCase()}<br>
        Total Companies: ${d.tot}<br>
       `)
                .style("stroke", "black")
                .style("opacity", 1);
        })
        .on("mouseout", function () { tooltip.style("opacity", 0) })
        .transition().duration(3000).delay(400)
        .attr("width", d => x(d.tot));
}

async function createIndustryCategoryTable() {
    var industry_cat_data = `<tr><th>Company Size</th><th>Category</th><th>Count</th></tr>`
    industry_cat_data += await
        d3.csv("data/company_size_world.csv/part-00000-39189e2b-5e01-48f6-a9bd-76ed492c578c-c000.csv",
            d => {
                switch (d.size) {
                    case "10001+":
                        size_type = "Very Large";
                        break;
                    case "1001-5000":
                    case "5001-10000":
                        size_type = "Large";
                        break;
                    case "501-1000":
                    case "201-500":
                        size_type = "Medium";
                        break;
                    default:
                        size_type = "Small";
                };

                var table = `<tr>
           <td>${d.size}</td>
           <td>${size_type}</td>
           <td>${d.count}</td>
          </tr>`;
                return table;
            }
        )

    d3.select('#industry_cat')
        .html(industry_cat_data)
        .attr("background-color", "black")
        .transition()
        .duration(3000).delay(400)
        .attr("background-color", "yellow");
}

async function addYearsOptions() {
    var founded_industry_companies = "data/company_founded_industry_companies.csv/part-00000-9532f76e-79e3-4b46-b126-a7f65bd2e6ca-c000.csv";
    var fic = await d3.csv(founded_industry_companies)
    console.log("founded_industry_companies");
    console.log(fic);
    fic = fic.filter((d, i) => {
        year = +(d.founded ? d.founded : 0)
        return (year >= 1980 && year <= 2022);
    });

    fic = fic.sort((a, b) =>
        d3.descending(+a.tot, +b.tot))

    let yr_options = [...new Set(fic.map(d => +(d.founded ? d.founded : 0)))];
    let sctr_options = [...new Set(fic.map(d => d.industry))];

    d3.select("#years")
        .selectAll("option")
        .data(yr_options)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    d3.select("#start_yr")
        .selectAll("option")
        .data(yr_options)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    d3.select("#end_yr")
        .selectAll("option")
        .data(yr_options.reverse())
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

}

async function createPieDigramForIndustryTypes() {
    var founded_industry_companies = "data/company_founded_industry_companies.csv/part-00000-9532f76e-79e3-4b46-b126-a7f65bd2e6ca-c000.csv";
    var fic = await d3.csv(founded_industry_companies);

    var radius = 150
    //var pie = d3.pie().value(d.count);
    var arc = d3.arc().innerRadius(0).outerRadius(radius);

    //var yearSelected = d3.select("#years").html(this.value);
    var yearSelected = +document.getElementById("years").value;
    console.log("yearSelected: " + yearSelected);


    var pie_data = fic.filter(d => d.founded == yearSelected).sort((a, b) =>
        d3.descending(+a.count, +b.count)).filter((d, i) => i <= 4)

    var top_5_industry = pie_data.map(d => d.industry.toUpperCase())

    d3.select("#sector")
        .selectAll("option")
        .data(top_5_industry)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    var tots = d3.sum(pie_data, d => d.count);
    pie_data = pie_data.map(d => { d.share = d.count / tots * 100; return d; })

    var color_band = d3.scaleOrdinal()
        .domain(pie_data)
        .range(d3.schemeDark2);

    var pie = d3.pie();
    var share = pie_data.map(d => d.share);

    var label = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);

    var pie_svg = d3.select('#per_yr_pie')
        .append('g')
        .attr("transform", "translate(" + 170 + "," + 150 + ")")
        .selectAll("path")
        .data(pie(share))
        .enter();

    pie_svg.append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => color_band(i));

    pie_grp = ['A', 'B', 'C', 'D', 'E']
    var arcOver = d3.arc()
        .innerRadius(0)
        .outerRadius(150 + 10);

    var arcs = pie_svg.selectAll("g.slice")
        .data(pie).enter().append("svg:g")
        .attr("class", "slice");

    var arc = d3.arc().outerRadius(radius).innerRadius(0)

    pie_svg
        .selectAll('path')
        .attr("stroke", "white")
        .style("stroke-width", "3px")
        .style("opacity", 1);

    pie_svg
        .append("text")
        .attr("transform", d => "translate(" + label.centroid(d) + ")")
        .text((d, i) => pie_grp[i] + ' : ' + d3.format(".0f")(share[i]) + '%')//pie_data[i].industry)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .attr("color", 'white')
        .style('fill', '#FFFFFF');


    //pie_data
    var ySeg = d3.scaleBand().domain(top_5_industry).range([0, top_5_industry.length - 1]);


    d3.select("#segment_bar").selectAll("*").remove();

    var segSvg = d3.select("#segment_bar")
        .selectAll();

    segSvg
        .data(top_5_industry)
        .enter()
        .append("rect")
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', 0)
        .attr('y', (d, i) => 50 * i + 50)
        .attr('fill', (d, i) => color_band(i));

    //font-weight="bold"
    segSvg
        .data(top_5_industry)
        .enter()
        .append("text")
        .text((d, i) => pie_grp[i])
        .attr('x', 8)
        .attr('y', (d, i) => 50 * i + 50 + 10)
        .attr("dy", ".35em")
        .style("font-size", 8)
        .style("font-weight", 'bold')
        .style("text-anchor", "middle")
        .attr("color", 'white')
        .style('fill', '#FFFFFF');

    segSvg
        .data(top_5_industry)
        .enter()
        .append("text")
        .text(d => d)
        .attr('x', 22)
        .attr('y', (d, i) => 50 * i + 50 + 10)
        .attr("dy", ".35em")
        .style("font-size", 8);


    d3.select("#sector")
        .selectAll("option")
        .data(top_5_industry)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

}

{/* <label for="start_yr" style="color:navy;text-align:center">Choose year range:</label>
<select name="start_yr" id="start_yr" onchange="createScatterPlotForYearsTreds()">
    <option>1980</option>
</select>
<select name="end_yr" id="end_yr" onchange="createScatterPlotForYearsTreds()">
    <option>2022</option>
</select>
<label for="sector" style="color:navy;text-align:center">Choose industry type:</label>
<select name="sector" id="sector" onchange="createScatterPlotForYearsTreds()">
    <option>INFORMATION TECHNOLOGY AND SERVICES</option>
</select> */}

async function createScatterPlotForYearsTreds(startYearSelected, endYearSelected, sector = "Top 5 Sectors") {

    if (startYearSelected >= endYearSelected) {
        alert(`Error: Wrong Range of year Selected:
        1st Year: ${startYearSelected}, 2nd Year: ${endYearSelected}
        1st Year must be smaller than 2nd year!`);
        return (0);
    }
    d3.select("#scatter_plot").selectAll("*").remove();

    var all_indstry_data = await d3.csv("data/company_founded_industry_top10.csv/part-00000-a2ef1f5b-bba1-4790-9913-3c1dcd520da6-c000.csv",
        d => {
            d.industry = d.industry.toUpperCase();
            return d;
        });
    if (sector == "Top 5 Sectors") {
        all_indstry_data = all_indstry_data.filter(d => (+d.founded >= startYearSelected
            && +d.founded <= endYearSelected))
    }
    else {
        all_indstry_data = all_indstry_data.filter(d => (+d.founded >= startYearSelected
            && +d.founded <= endYearSelected && d.industry == sector))
    }


    const margin = { top: 35, right: 30, bottom: 0, left: 38 },
        width = 1200 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    const scr_svg = d3.select("#scatter_plot")
        .attr("width", width + 100)
        .attr("height", height + 100)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const max_indstry_cnt = d3.max(all_indstry_data, d => +d.count)

    var scrX = d3.scaleLinear()
        .domain([startYearSelected, endYearSelected])
        .range([0, width]);

    scr_svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(scrX));

    var scrY = d3.scaleLinear()
        .domain([0, max_indstry_cnt])
        .range([height, 0]);

    scr_svg.append("g")
        .call(d3.axisLeft(scrY));

    var scrY = d3.scaleLinear()
        .domain([0, max_indstry_cnt])
        .range([height, 0]);

    const allScrCat = [...new Set(all_indstry_data.map(d => d.industry))];

    var scrColor = d3.scaleOrdinal()
        .domain(allScrCat)
        .range(d3.schemeCategory10);

    var tooltip = d3.select("#scatter_plot")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    scr_svg.append('g')
        .selectAll("dot")
        .data(all_indstry_data)
        .enter()
        .append("circle")
        .attr("cx", d => scrX(+d.founded))
        .attr("cy", 0)
        .attr("r", 3)
        .on("mouseover", function (event, d) {
            console.log(`Year: ${d.founded}
            Year: ${d.industry.toUpperCase()}
            Total Companies: ${d.count}`);
            tooltip.style("opacity", 1)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px")
                .style("stroke-width", 4)
                .html(`Year: ${d.founded}<br>
                       Year: ${d.industry.toUpperCase()}<br>
                       Total Companies: ${d.count}<br>`)
                .style("stroke", "black")
                .style("opacity", 1);
        })
        .on("mouseout", function () { tooltip.style("opacity", 0) })
        .transition().duration(200).delay(400)
        .attr("width", d => scrX(d.tot))
        .transition().duration(3000).delay((d, i) => i * 10)
        .attr("cx", d => scrX(+d.founded))
        .attr("cy", d => height)
        .attr("r", d => 10)
        .style("fill", (d, i) => scrColor(d.industry))
        .transition().duration(3000).delay((d, i) => i * 0.1)
        .attr("cx", d => scrX(+d.founded))
        .attr("cy", d => scrY(+d.count))
        .attr("r", d => Math.max(5, d.count / 1000))
        .style("fill", (d, i) => scrColor(d.industry));
}


async function annotationDetails() {
    const annotationsBars = [
        {
            note: {
                label: "Mostly Tech Companies. Yet to register",
                title: "China Linkedin",
                wrap: 200,  // try something smaller to see text split in several lines
                padding: 10   // More = text lower

            },
            color: ["#cc0000"],
            x: 130,
            y: 239.06172 + 10,
            dy: -20,
            dx: 130,
            subject: { radius: 50, radiusPadding: 90 },
            type: d3.annotationCalloutElbow,
            connector: { end: "arrow" }
        },];

    const makeAnnotationsBars = d3.annotation()
        .annotations(annotationsBars);

    d3.select("#horizontal-bars")
        .append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotationsBars);


    //<rect x="0" y="46.17283950617283" width="36.80921645346788" height="16.790123456790123" fill="#2ca02c"></rect>
    const AnnotationsBarzilIndia = [
        {
            note: {
                label: "India/Brazil/France",
                title: "Similar Economy",
                wrap: 350,  // try something smaller to see text split in several lines
                padding: 10   // More = text lower

            },
            color: ["#cc0000"],
            x: 140,
            y: 70,
            dy: 0,
            dx: 100,
            subject: { radius: 20, radiusPadding: 20 },
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" }
        },];

    const makeAnnotationsBarzilIndia = d3.annotation()
        .annotations(AnnotationsBarzilIndia);

    d3.select("#horizontal-bars")
        .append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotationsBarzilIndia);

}


async function annotationDetailsScatterPlot() {

    const covidEraImpt = [
        {
            note: {
                label: "New Business decilned Severly!!",
                title: "Covid impact",
                wrap: 350,  // try something smaller to see text split in several lines
                padding: 10   // More = text lower

            },
            color: ["#cc0000"],
            x: 1139,
            y: 500,
            dy: 100,
            dx: 100,
            subject: { radius: 100, radiusPadding: 20 },
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" }
        },];

    const anntCovidEraImpt = d3.annotation()
        .annotations(covidEraImpt);

    d3.select("#scatter_plot")
        .append("g")
        .attr("class", "annotation-group")
        .call(anntCovidEraImpt);


    const techEra = [
        {
            note: {
                label: "Industry driven due to advance computer technology",
                title: "Tech Boom!!",
                wrap: 350,  // try something smaller to see text split in several lines
                padding: 10   // More = text lower

            },
            color: ["#cc0000"],
            x: 800,
            y: 500,
            dy: -100,
            dx: -200,
            className: "show-bg",
        },];

    const anntTechEra = d3.annotation()
        .annotations(techEra);

    d3.select("#scatter_plot")
        .append("g")
        .attr("class", "annotation-group")
        .call(anntTechEra);

    const scatterAnnotation = [
        {
            note: {
                label: "Due to covid we see there's steep decline on new startup. "
                       +"On average the trends increases from commodity hardware/construction "
                       +"to compute based technology driven industry!",

                title: "Industry-wise Trends",
                wrap: 350,  // try something smaller to see text split in several lines
                padding: 10   // More = text lower

            },
            color: ["#cc0000"],
            x: 100,
            y: 100,
            dy: 0,
            dx: 0
        },];

    const makescatterAnnotation = d3.annotation()
        .annotations(scatterAnnotation);

    d3.select("#scatter_plot")
        .append("g")
        .attr("class", "annotation-group")
        .call(makescatterAnnotation);






    // <circle cx="774.5263157894738" cy="540.5126098586168" r="5" style="fill: rgb(148, 103, 189);"></circle>

}