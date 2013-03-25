var response,filter,order,fc,bandwidth,fp,fs,z0,er,method,line;
$(document).ready(function(){
	$("#responseSelect").change(function(){
		if($(this).val()==2)
			$("#frequency-table-append").after("<tr>\
							<td>Cutoff Frequency:</td>\
							<td>\
								<input type=\"number\" name=\"fc\">\
								<select size=\"1\" name=\"fc-unit\">\
									<option value=\"1\">Hz</option>\
									<option value=\"3\">kHz</option>\
									<option value=\"6\">MHz</option>\
									<option value=\"9\" selected>GHz</option>\
								</select>\
							</td>\
						</tr>");
	});
});