var response,filter,order,fc,bandwidth,ripple,r0,z0,er,method,line,g;
$(document).ready(function(){
	$("#responseSelect").change(function(){
		if($(this).val()==2)
			$("#frequency-table-append").after("<tr>\
							<td>Passband ripple (dB) :</td>\
							<td>\
								<input type=\"number\" name=\"ripple\" value=\"0.5\">\
							</td>\
						</tr>");
	});
	$("#filterSelect").change(function(){
		if($(this).val()>2)
			$("#frequency-table-append").after("<tr>\
							<td>Bandwidth:</td>\
							<td>\
								<input type=\"number\" value=\"1\" name=\"bandwidth\">\
								<select size=\"1\" name=\"bandwidth-unit\" class=\"units\">\
									<option value=\"0\">Hz</option>\
									<option value=\"3\">kHz</option>\
									<option value=\"6\">MHz</option>\
									<option value=\"9\" selected>GHz</option>\
								</select>\
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
	
	$("#calculate-lumped").click(function(){
	//get values
		response=$('#filter-form-container select[name=response]').val()
		filter=$('#filter-form-container select[name=filter]').val()
		r0=$('#frequency-form-container input[name=r0]').val()
		order=$('#frequency-form-container input[name=order]').val()
		if($("#filterSelect").val()>2)
			bandwidth=$('#frequency-form-container input[name=bandwidth]').val()*Math.pow(10,$('#frequency-form-container select[name=bandwidth-unit]').val())
		fc=$('#frequency-form-container input[name=fc]').val()*Math.pow(10,$('#frequency-form-container select[name=fc-unit]').val())
		g=new Array();
		g[0]=[1,3];//type: 1=cap;0=ind,3=res;
		if(response==1){//butterworth g
			for(i=1;i<=order;++i){
				g[i]=[2*Math.sin((2*i-1)*Math.PI/(2*order)),i%2];
			}
			g[i]=[1,3];
		}else{//chebychev g
			ripple=$('#frequency-form-container input[name=ripple]').val()
			var arg=Math.pow(Math.E,ripple/17.37);
			var beta=Math.log((arg+1/arg)/(arg-1/arg));
			arg=Math.pow(Math.E,beta/(2*order));
			var gamma=(arg-1/arg)/2;
			g[1]=[(2/gamma)*Math.sin(Math.PI/(2*order)),1]
			for(i=2;i<=order;++i){
				arg=Math.PI/(2*order);
				g[i]=[(4*Math.sin((2*i-1)*Math.PI/(2*order))*Math.sin((2*i-3)*Math.PI/(2*order))) / (g[i-1][0]*(Math.pow(gamma,2)+Math.pow(Math.sin((i-1)*Math.PI/order),2) )),i%2];
			}
			if(order%2==0){
				arg=Math.pow(Math.E,beta/4);
				g[i]=[Math.pow((arg+1/arg)/(arg-1/arg),2),i%2];
				g[i+1]=[1,3];
			}else g[i]=[1,3]
		}
		var w=2*Math.PI*fc;
		if(filter==1)//low pass 
			for(i=g.length-1;i>=0;i--)
				if(g[i][1]==0)//ind
					g[i][0]*=r0/w;
				else if(g[i][1]==1)//cap
					g[i][0]*=1/(r0*w);
				else if(g[i][1]==3)//res
					g[i][0]*=r0;
		else if(filter==2)//high pass
			for(i=g.length-1;i>=0;i--)
				if(g[i][1]==0){//ind
					g[i][0]=1/(r0*w*g[i][0]);
					g[i][1]=1;
				}else if(g[i][1]==1){//cap
					g[i][0]=r0/(g[i][0]*w);
					g[i][1]=0;
				}else if(g[i][1]==3)//res
					g[i][0]*=r0;
		else if(filter==3){//band pass
			for(i=g.length-1;i>=0;i--)
				if(g[i][1]==0){//ind conv to series 2
					var t=g[i][0];
					g[i][0]=new Array();
					g[i][0][0]=[(t*r0)/bandwidth,0];
					g[i][0][1]=[bandwidth/(w*w*t*r0),1];
				}else if(g[i][1]==1){//cap conv to parallel 2
					var t=g[i][0];
					g[i][0]=new Array();
					g[i][0][0]=[r0/(t*bandwidth),0];
					g[i][0][1]=[(t*bandwidth)/(w*w*r0),1];
				}else if(g[i][1]==3)//res
					g[i][0]*=r0;
		}else if(filter==4){//band reject
			for(i=g.length-1;i>=0;i--)
				if(g[i][1]==0){//ind conv to series 2
					var t=g[i][0];
					g[i][0]=new Array();
					g[i][0][0]=[(t*r0*bandwidth)/(w*w),0];
					g[i][0][1]=[1/(bandwidth*t*r0),1];
				}else if(g[i][1]==1){//cap conv to parallel 2
					var t=g[i][0];
					g[i][0]=new Array();
					g[i][0][0]=[(t*bandwidth)/(r0*w*w),0];
					g[i][0][1]=[r0/(t*bandwidth),1];
				}else if(g[i][1]==3)//res
					g[i][0]*=r0;
		}
		
		//prototype values calculated. draw now
		var string='<table>';
		var com=new Array('Inductor','Capacitor','','Resistor');
		for(i=0;i<g.length;++i){
			string+="<tr><td>g "+i+":</td><td>"+(g[i][0].length?(com[g[i][0][0][1]]+": "+g[i][0][0][0]+"<br />"+com[g[i][0][1][1]]+": "+g[i][0][1][0]):(	com[g[i][1]]+": "+g[i][0]))+"</td></tr>";
		}
		string+="</table>";
		$("#lumped-output").html(string);
		
		
	})
	$("#method-next").click(function(){
		$("#container3").animate({"left":$("#container5").css("left")});
		//calculate circuit diagram
	});
});