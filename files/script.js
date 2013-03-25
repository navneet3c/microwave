var response,filter,order,fc,bandwidth,ripple,fp,fs,z0,er,method,line;
$(document).ready(function(){
	$("#responseSelect").change(function(){
		if($(this).val()==2)
			$("#frequency-table-append").after("<tr>\
							<td>Passband ripple (dB) :</td>\
							<td>\
								<input type=\"number\" name=\"ripple\">\
							</td>\
						</tr>");
	});
	
	$(".scrollnext").click(function(){
		$("#top-container").animate({"left":"-="+parseInt($("body").css("width"))},'slow');
		return false;
	});
	$("#lumped-next").click(function(){
		$("#container3").animate({"left":$("#container4").css("left")});
		$("#lumped-next-container").fadeOut();
	});
	$("#method-next").click(function(){
		$("#container3").animate({"left":$("#container5").css("left")});
	});
});