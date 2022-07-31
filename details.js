async function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}


//
//
//
//
////var pie = d3.pie().value(d.count);
//var arc = d3.arc().innerRadius(0).outerRadius(radius);
//
//var pie_data = fic.filter( d=> d.founded == 2001).sort((a,b) =>
//    d3.descending(+a.count,+b.count)).filter((d,i) => i<=4 )
//
//var top_5_industry = pie_data.map(d => d.in)
//console.log(pie_data);
//
//var tots = d3.sum(pie_data, d=> d.count);
//pie_data = pie_data.map(d =>  {d.share = d.count/tots*100; return d;} )
//
//var color_band = d3.scaleOrdinal()
//  .domain(pie_data)
//   .range(['pink','yellow','lightgreen','cyan','lightblue']);
//
//var pie = d3.pie();
//var share = pie_data.map(d => d.share);
//
//var label = d3.arc()
//    .outerRadius(radius)
//    .innerRadius(0);
//
//var pie_svg = d3.select('#per_yr_pie')
//.append('g')
//.attr("transform","translate("+150+","+150+")")
//.selectAll()
//.data(pie(share))
//.enter();
//
//pie_svg.append('path')
//.attr('d',arc)
//.attr('fill', (d,i) => color_band(i));
//
//pie_grp = ['A', 'B', 'C', 'A', 'D']
//var arcOver = d3.arc()
//    .innerRadius(0)
//    .outerRadius(150 + 10);
//
//const annotationsRight = [
//    {
//    note: {
//      label: "Thanks to its marketing policy, in 2021 France has reached the third position.",
//      title: "France product sales",
//      wrap: 200,  // try something smaller to see text split in several lines
//      padding: 10   // More = text lower
//
//    },
//    color: ["#cc0000"],
//    x: x(2500),
//    y: 100,
//    dy: 100,
//    dx: 100
//  }];
//
//const makeAnnotations = d3.annotation()
//  .annotations(annotationsRight)
//
//var arcs = pie_svg.selectAll("g.slice")
//           .data(pie).enter().append("svg:g")
//           .attr("class", "slice");
//
//var arc = d3.arc().outerRadius(radius).innerRadius(0)
//
//pie_svg.append("text")
//.attr("transform", d=> "translate(" + label.centroid(d) + ")")
//.text( (d,i) => pie_grp[i]+' : '+d3.format(".0f")(share[i])+'%')//pie_data[i].industry)
//.style("text-anchor", "middle")
//.style("font-size", 15);