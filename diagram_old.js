async function init(evt) {
//document.getElementById("defaultOpen").click();
//d3.select("#defaultOpen").selectAll().html("<body></body>")
d3.select("defaultOpen").html = ""

var all_cntry_list = await d3.csv('data/company_dataset_list.csv');
all_cntry_list = all_cntry_list.sort((a,b) =>
    d3.descending(+a.tot,+b.tot)).filter((d,i) => i<=15)

const margin = {top: 20, right: 30, bottom: 40, left:120},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

total_comp = all_cntry_list.map( (d,i) => +d.tot)
max_total=d3.max(total_comp)

var color = d3.scaleOrdinal(d3.schemeCategory10);
const svg = d3.select("#summary_bars")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Add X axis
  const x = d3.scaleLinear()
    .domain([0, max_total])
    .range([ 0, width]);

// Y axis
  const y = d3.scaleBand()
    .range([ 0, height ])
    .domain(all_cntry_list
       .map((d,i)=>d.country.toUpperCase())
      )
    .padding(.2);

   const ys = d3.scaleBand()
    .range([ 0, height ])
    .domain(all_cntry_list
       .map((d,i)=>d.country)
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
    .attr("x", x(0) )
    .attr("y", d => ys(d.country))
    .attr("width", 0)
    .attr("height", y.bandwidth())
    .attr("fill", (d,i) => color(i))
    .on("mouseover", function(event, d) {
     tooltip.style("opacity",1)
     .style("left", (event.pageX)+"px" )
     .style("top",  (event.pageY)+"px" )
     .style("stroke-width", 4)
     .html(`Country: ${d.country.toUpperCase()}<br>
            Total Companies: ${d.tot}<br>
           `)
      .style("stroke", "black")
      .style("opacity", 1);
    })
    .on("mouseout", function() { tooltip.style("opacity",0) })
    .transition().duration(3000).delay(400)
    .attr("width",d => x(d.tot))

//const industry_table = d3.select("#industry_cat")
//    .append("foreignObject")
//    .attr("width", width + margin.left + margin.right)
//    .attr("height", height + margin.top + margin.bottom)
//    .append("xhtml:table");

var industry_cat_data = `<tr><th>Company Size</th><th>Category</th><th>Count</th></tr>`
industry_cat_data += await
  d3.csv("https://nirojuiuc.github.io/data/company_size_world.csv/part-00000-39189e2b-5e01-48f6-a9bd-76ed492c578c-c000.csv",
  d=> {
    switch(d.size) {
     case "10001+":
       size_type="Very Large";
       break;
     case "1001-5000":
     case "5001-10000":
       size_type="Large";
       break;
     case "501-1000":
     case "201-500":
       size_type="Medium";
       break;
     default:
        size_type="Small";
      };

     var table=`<tr>
       <td>${d.size}</td>
       <td>${size_type}</td>
       <td>${d.count}</td>
      </tr>`;
     return table;
       }
)

d3.select('#industry_cat')
.html(industry_cat_data)
.attr("background-color","black" )
.transition()
.duration(3000).delay(400)
.attr("background-color","yellow" );

var founded_industry_companies = "data/company_founded_industry_companies.csv/part-00000-9532f76e-79e3-4b46-b126-a7f65bd2e6ca-c000.csv";
var fic=await d3.csv(founded_industry_companies)

fic = fic.filter((d,i) => {
 year= +(d.founded?d.founded:0)
 return (year >= 2000 && year <= 2022);
});

fic = fic.sort((a,b) =>
    d3.descending(+a.tot,+b.tot))

let yr_options = [...new Set(fic.map(d => +(d.founded?d.founded:0)))];

d3.select("#years")
.selectAll("option")
.data(yr_options)
.enter()
.append("option")
.text( d => d)
.attr("value", d => d);


var radius=150
//var pie = d3.pie().value(d.count);
var arc = d3.arc().innerRadius(0).outerRadius(radius);

//var yearSelected = d3.select("#years").html(this.value);
var yearSelected = +document.getElementById("years").value;
console.log("yearSelected: "+yearSelected)

var pie_data = fic.filter( d=> d.founded == yearSelected).sort((a,b) =>
    d3.descending(+a.count,+b.count)).filter((d,i) => i<=4 )

var top_5_industry = pie_data.map(d => d.industry.toUpperCase())
console.log("top_5_industry");
console.log(top_5_industry);

var tots = d3.sum(pie_data, d=> d.count);
pie_data = pie_data.map(d =>  {d.share = d.count/tots*100; return d;} )

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
.attr("transform","translate("+170+","+150+")")
.selectAll("path")
.data(pie(share))
.enter();

pie_svg.append('path')
.attr('d',arc)
.attr('fill', (d,i) => color_band(i));

pie_grp = ['A', 'B', 'C', 'D', 'E']
var arcOver = d3.arc()
    .innerRadius(0)
    .outerRadius(150 + 10);

const annotationsRight = [
   {
   note: {
     label: "Thanks to its marketing policy, in 2021 France has reached the third position.",
     title: "France product sales",
     wrap: 200,  // try something smaller to see text split in several lines
     padding: 10   // More = text lower

   },
   color: ["#cc0000"],
   x: x(2500),
   y: 100,
   dy: 100,
   dx: 100
 }];

const makeAnnotations = d3.annotation()
  .annotations(annotationsRight)

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
.attr("transform", d=> "translate(" + label.centroid(d) + ")")
.text( (d,i) => pie_grp[i]+' : '+d3.format(".0f")(share[i])+'%')//pie_data[i].industry)
.style("text-anchor", "middle")
.style("font-size", 15)
.attr("color", 'white')
.style('fill', '#FFFFFF');


//pie_data
var ySeg = d3.scaleBand().domain(top_5_industry).range([0,4])

d3.select("#segment_bar")
.selectAll()
.data(pie_grp)
.enter()
.append("rect")
.attr('width', 20)
.attr('height',20)
.attr('x', 0)
.attr('y', (d,i) => 50*i+50)
.attr('fill', (d,i) => color_band(i));

//font-weight="bold"
d3.select("#segment_bar")
.selectAll()
.data(pie_grp)
.enter()
.append("text")
.text( d => d)
.attr('x', 8)
.attr('y', (d,i) => 50*i+50+10)
.attr("dy", ".35em")
.style("font-size", 8)
.style("font-weight", 'bold')
.style("text-anchor", "middle")
.attr("color", 'white')
.style('fill', '#FFFFFF');

d3.select("#segment_bar")
.selectAll()
.data(top_5_industry)
.enter()
.append("text")
.text( d => d)
.attr('x', 22)
.attr('y', (d,i) => 50*i+50+10)
.attr("dy", ".35em")
.style("font-size", 8);


var all_indstry_data = await d3.csv("data/company_founded_industry_top10.csv/part-00000-a2ef1f5b-bba1-4790-9913-3c1dcd520da6-c000.csv",
   d => {
        d.industry = d.industry.toUpperCase();
        return d;
     });

const margin1 = {top: 20, right: 30, bottom: 40, left:120},
    width1 = 1000 - margin1.left - margin1.right,
    height1 = 700 - margin1.top - margin1.bottom;

const scr_svg = d3.select("#scatter_plot")
.append("svg")
.attr("width", width1)
.attr("height", height1)
.append("g")
.attr("transform","translate(" + margin1.left + "," + margin1.top + ")");

const max_indstry_cnt = d3.max(all_indstry_data, d => +d.count)

var scrX = d3.scaleLinear()
    .domain([1980, 2022])
    .range([ 0, width1 ]);

scr_svg.append("g")
    .attr("transform", "translate(0," + height1 + ")")
    .call(d3.axisBottom(scrX));

var scrY = d3.scaleLinear()
    .domain([0, max_indstry_cnt])
    .range([ height1, 0]);

scr_svg.append("g")
    .call(d3.axisLeft(scrY));

var scrY = d3.scaleLinear()
    .domain([0, max_indstry_cnt])
    .range([ height1, 0]);

const allScrCat = [...new Set(all_indstry_data.map(d => d.industry))];

var scrColor =  d3.scaleOrdinal()
.domain(allScrCat)
 .range(d3.schemeCategory10);


scr_svg.append('g')
    .selectAll("dot")
    .data(all_indstry_data)
    .enter()
    .append("circle")
    .attr("cx", d => scrX(+d.founded) )
    .attr("cy", 0 )
    .attr("r", 5 )
    .transition().duration(3000).delay((d,i)=>i*10)
    .attr("cx", d => scrX(+d.founded) )
    .attr("cy", d => height1)
    .attr("r", d =>  d.count/1000 )
    .style("fill", (d,i)=>scrColor(i))
    .transition().duration(3000).delay((d,i)=>i*0.1)
    .attr("cx", d => scrX(+d.founded) )
    .attr("cy", d => scrY(+d.count))
    .attr("r", d =>  d.count/1000 )
    .style("fill", (d,i)=>scrColor(i))

//twnty_yrs_industry_data = d3.rollups(
//twnty_yrs_industry_data, d=> +d.count, d=> d.industry)
//
//console.log("twnty_yrs_industry_data");
//console.log(twnty_yrs_industry_data);



//industries_selected_raw.includes(d.industry)
//var twnty_yrs_industry_data = fic.sort((a,b) =>
//    d3.descending(+a.count,+b.count))
//    .filter((d,i) => i <= 19 )

//var twnty_yrs_industry_data = d3.nest()
//  .key(function(d) { return d.name; })
//  .rollup(function(v) { return {
//    count: v.length,
//    total: d3.sum(v, function(d) { return d.amount; }),
//    avg: d3.mean(v, function(d) { return d.amount; })
//  }; })
//  .entries(expenses);

//const stack = d3.stack().keys(industries_selected);
//const stackedValues = stack(data);
//const stackedData = [];
//// Copy the stack offsets back into the data.
//stackedValues.forEach((layer, index) => {
//  const currentStack = [];
//  layer.forEach((d, i) => {
//    currentStack.push({
//      values: d,
//      year: data[i].year
//    });
//  });
//  stackedData.push(currentStack);
//});
//
//// Create scales
//const yScale = d3
//  .scaleLinear()
//  .range([height1, 0])
//  .domain([0, d3.max(stackedValues[stackedValues.length - 1], dp => dp[1])]);
//const xScale = d3
//  .scaleLinear()
//  .range([0, width1])
//  .domain(d3.extent(data, dataPoint => dataPoint.year));
//
//const area = d3
//  .area()
//  .x(dataPoint => xScale(dataPoint.year))
//  .y0(dataPoint => yScale(dataPoint.values[0]))
//  .y1(dataPoint => yScale(dataPoint.values[1]));
//
//const series = grp
//  .selectAll(".series")
//  .data(stackedData)
//  .enter()
//  .append("g")
//  .attr("class", "series");
//
//series
//  .append("path")
//  .attr("transform", `translate(${margin1.left},0)`)
//  .style("fill", (d, i) => color1[i])
//  .attr("stroke", "steelblue")
//  .attr("stroke-linejoin", "round")
//  .attr("stroke-linecap", "round")
//  .attr("stroke-width", strokeWidth)
//  .attr("d", d => area(d));
//
//// Add the X Axis
//chart
//  .append("g")
//  .attr("transform", `translate(0,${height1})`)
//  .call(d3.axisBottom(xScale).ticks(data.length));
//
//// Add the Y Axis
//chart
//  .append("g")
//  .attr("transform", `translate(0, 0)`)
//  .call(d3.axisLeft(yScale));



//pie_svg.append("g")
//  .call(makeAnnotations)

//pie_svg.on("mouseover", function(d) {
//    tooltip.transition().duration(200)
//      .style("opacity", 0.9);
//    tooltip.select("div").html(d.data.name + " <br><strong>" + d.data.value + "</strong>")
//      .style("position", "fixed")
//      .style("text-align", "center")
//      .style("width", "120px")
//      .style("height", "45px")
//      .style("padding", "2px")
//      .style("font", "12px sans-serif")
//      .style("background", "lightsteelblue")
//      .style("border", "0px")
//      .style("border-radius", "8px")
//      .style("left", (d3.event.pageX + 15) + "px")
//      .style("top", (d3.event.pageY - 28) + "px");
//    d3.select(this.firstChild).transition(2000)
//      .attr("d", arcOver);
//});


//var X = d3.domain([1982, max_yr]).range([ 0,  200])
//var Y = d3.domain([1982, max_yr]).range([ 0,  200])
//d3.select('#size_balloon').append('svg')
// .attr('viewBox', [0, 0, width, 200])
// .selectAll()
// .data(d3.range(5))
// .enter()
//.append("circle")
//.attr('cx', "50%")
//.attr('cy', "50%")
//.attr('r',  (d,i) => 10+Math.pow(2,i))
//.attr('fill',  (d,i) => color(i))
//;

//var b_svg = d3.select("#size_balloon")
//.append('svg');
//.attr('transform', "translate("+ margin +","+margin+")")
//b_svg
//.selectAll()
//.data(d3.range(20))
//.enter()
//.append('circle')
//.attr('cx', 10)
//.attr('cy', 200)
//.attr('r',  function(d,i) {return 20;} )
//.attr('fill', 'green' );
//
//b_svg
//.append('g')
//.attr("transform","translate("+margin+","+margin+")")
//.call(d3.axisLeft(CY)
//             .tickValues([10,20,50,100])
//             .tickFormat(d3.format("~s")));
//
//b_svg
//.append('g')
//.attr('transform', "translate("+ margin +","+(300 - margin)+")")
//.call(d3.axisBottom(CX)
//             .tickValues([10,20,50,100])
//             .tickFormat(d3.format("~s")));

//industry_table.append("table")
//     .attr("style","width:33%;border:1px solid black;")
//     .attr("class", "head")
//     .selectAll("th")
//     .data(industry_cat_data)
//     .enter()
//     .append("tr")
//     .attr("style","width:33%;border:1px solid black;")
//     .append("td")
//     .html(function (d) {return d.size})
//     .append("td")
//     .html(d =>
//       {switch(d.size) {
//            case "10001+":
//              size_type="Very Large Company";
//              break;
//            case "1001-5000":
//            case "5001-10000":
//              size_type="Large Company";
//              break;
//            default:
//               size_type="Small or Medium Company";
//          }
//          return size_type;
//          }
//       )
//     .append("td")
//     .html(d => d.count);



//var margin = {top: 20, right: 30, bottom: 40, left: 90},
//    width = 460 - margin.left - margin.right,
//    height = 400 - margin.top - margin.bottom;

//var xs = d3.scaleBand().domain(data.map((d,i) => i)
//         .filter((i)=> i<= 10))
//         .range([0,400])
//var ys = d3.scaleLinear().domain([0,max_range]).range([400,0])
//
//d3.select('svg')
//.append('g')
//.attr("transform","translate("+margin+","+margin+")")
//.selectAll()
//.data(data)
//.enter()
//.append('rect')
//.attr('x', function(d,i) {return xs(i);})
//.attr('y', function(d,i) {return ys(d);})
//.attr('width',xs.bandwidth())
//.attr('height', function(d,i) {return height - ys(12);} )
//.attr('fill', 'red');
//
//d3.select('svg')
//.append("g")
//.attr("transform","translate("+margin+","+margin+")")
//.call(d3.axisLeft(ys));
//
//d3.select('svg')
//.append("g")
//.attr("transform","translate("+margin+","+(500-margin)+")")
//.call(d3.axisBottom(xs));


//const ddd = await d3.csv('free_company_dataset.csv');
//console.log(ddd[4])
//console.log(all_files);
//d3.queue()
//  .defer(d3.json, "data/world-110m.json")
//  .defer(d3.csv, "data/company_dataset_list.csv")
//  .await(ready);
//function ready(error, world, names) {
//  if (error) throw error;
//  var countries1 = topojson.feature(world, world.objects.countries).features;
//    countries = countries1.filter(function(d) {
//    cntry = d.name
//    return names.some(function(n) {
//      if (d.id == n.id) return d.name = n.name;
//    })});
//  svg.selectAll("path")
//			.data(countries)
//			.enter()
//			.append("path")
//			.attr("stroke","green")
//			.attr("stroke-width",1)
//            .attr("fill", "white")
//			.attr("d", path )
//			.on("mouseover",function(d,i){
//                d3.select(this).attr("fill","grey").attr("stroke-width",2);
//                return tooltip.style("hidden", false).html(d.name);
//            })
//            .on("mousemove",function(d){
//                tooltip.classed("hidden", false)
//                       .style("top", (d3.event.pageY) + "px")
//                       .style("left", (d3.event.pageX + 10) + "px")
//                       .html(d.name);
//            })
//            .on("mouseout",function(d,i){
//                d3.select(this).attr("fill","white").attr("stroke-width",1);
//                tooltip.classed("hidden", true);
//            });
//};
//console.log(data[0])
//console.log(company_data[1])
//console.log(all_files)
//d3.select('svg')
//   .append('g')
//   .attr('transform', "translate("+ margin +","+margin+")")
//   .selectAll()
//   .data(data)
//   .enter()
//   .append('circle')
//   .attr('cx', function(d,i) {return xs(parseInt(d.AverageCityMPG));})
//   .attr('cy', function(d,i) {return ys(parseInt(d.AverageHighwayMPG));})
//   .attr('r',  function(d,i) {return 2+ parseInt(d.EngineCylinders);} );
//
//d3.select('svg')
//.append('g')
//.attr("transform","translate("+margin+","+margin+")")
//.call(d3.axisLeft(ys)
//             .tickValues([10,20,50,100])
//             .tickFormat(d3.format("~s")));
//
//d3.select('svg')
//.append('g')
//.attr('transform', "translate("+ margin +","+(300 - margin)+")")
//.call(d3.axisBottom(xs)
//             .tickValues([10,20,50,100])
//             .tickFormat(d3.format("~s")));

//const type = d3.annotationLabel
//
//const annotations = [{
//  note: {
//    label: "Longer text to show text wrapping",
//    bgPadding: 20,
//    title: "Annotations :)"
//  },
//  //can use x, y directly instead of data
//  data: { date: "18-Sep-09", close: 185.02 },
//  className: "show-bg",
//  dy: 137,
//  dx: 162
//}]
//
//const parseTime = d3.timeParse("%d-%b-%y")
//const timeFormat = d3.timeFormat("%d-%b-%y")
//
////Skipping setting domains for sake of example
//const x = d3.scaleTime().range([0, 800])
//const y = d3.scaleLinear().range([300, 0])
//
//const makeAnnotations = d3.annotation()
//  .editMode(true)
//  //also can set and override in the note.padding property
//  //of the annotation object
//  .notePadding(15)
//  .type(type)
//  //accessors & accessorsInverse not needed
//  //if using x, y in annotations JSON
//  .accessors({
//    x: d => x(parseTime(d.date)),
//    y: d => y(d.close)
//  })
//  .accessorsInverse({
//     date: d => timeFormat(x.invert(d.x)),
//     close: d => y.invert(d.y)
//  })
//  .annotations(annotations)
//
//d3.select("svg")
//  .append("g")
//  .attr("class", "annotation-group")
//  .call(makeAnnotations)


//const annotations = [
//  {
//    note: { label: "Hi" },
//    x: 100,
//    y: 100,
//    dy: 137,
//    dx: 162,
//    subject: { radius: 50, radiusPadding: 10 },
//  },
//];
//
//d3.annotation().annotations(annotations);
//
//evt.currentTarget.className = " active";

function takeActionByYear() {
  var yearSelected = +document.getElementById("years").value;

  }


}

