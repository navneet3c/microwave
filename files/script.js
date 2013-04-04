var response,filter,order,fc,bandwidth,ripple,r0,method,line,g,Er;
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
		response=$('#filter-form-container select[name=response]').val()//chebyshev r butterworth
		filter=$('#filter-form-container select[name=filter]').val()
		r0=$('#frequency-form-container input[name=r0]').val()
		order=$('#frequency-form-container input[name=order]').val()
		if($("#filterSelect").val()>2)
			bandwidth=$('#frequency-form-container input[name=bandwidth]').val()*Math.pow(10,$('#frequency-form-container select[name=bandwidth-unit]').val())
		else
			$("#method-table-append").after("<tr>\
							<td>Type of design:</td>\
							<td>\
								<select size=\"1\" name=\"method\">\
									<option value=\"1\" selected>Stub Method</option>\
									<option value=\"2\">Stepped-Impedance Method</option>\
								</select>\
							</td>\
						</tr>");
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
		console.log(response+filter);
		Er=$("#filter-form-container select[name=er]").val();
		line=$("#filter-form-container select[name=line]").val();
		if(filter<=2){
			method=$("#filter-form-container select[name=method]").val();
			if(method==1){//stub for lpf hpf
		/*	
			for i=1:2:n
    z(i)=g(i);
end
%Every even numbered elements are capacitors and by using Richard's
%transformation the chara impedance is the inverse of the capacitance value
for i=2:2:n
    z(i)=(1/g(i));
end
% T-section is used in stub method of filter design.So the first element
% will be inductor. Inductors and capacitors are replaced by SC and OC
% stubs of lambda/8 length.Unit element is added to the first inductor
% and Kuroda's identity is applied

        N=1+(1/z(1));
        k(1)=N;
        k(2)=z(1)*N;
        j=3;
%In case of filter order of 5 or more
for i=2:n-1
    if rem(i,2)==1
%Each of the 3,5,7---(n-2)th inductor is splitted in to two inductors
%each of L/2 henries and
        z_half(j)=z(i)/2;            
        N=1+(1/z_half(j));
        k(j)=N*z_half(j);
        k(j+1)=0.5*N;
        k(j+2)=k(j);
        j=j+2;
        
    else
        k(j)=z(i);

    end;
j=j+1;
end;
%Last Inductor-UE combination is converted to Capacitor-UE using Kuroda's
%identity
        N=1+(1/z(n));        
        k(j)=z(n)*N;
        k(j+1)=N;

       
%All the impedance values are scaled using 50 ohms
z=k*50;
%Wheeler's Curve equations are ued to obtain the width of each of the
%sections
for i=1:2*n-1
A=((z(i)/60)*sqrt((E_eff+1)/2)+(((E_eff-1)/(E_eff+1))*(.23+(.11/E_eff))));
B=377*pi/(2*z(i)*sqrt(E_eff));
w1=.1588*10*8*exp(A)/(exp(2*A)-2);
w2=(.1588*10*2/pi)*(B-1-log(2*B-1)+((E_eff-1)/(2*E_eff))*(log(B-1)+0.39-0.61/E_eff));
if ((w1<=2*1.588) && (w1>0) && (imag(w1)==0))
    w(i)=w1;
elseif ((w2>2*1.588) && (w2>0) && (imag(w2)==0))
    w(i)=w2;
end;
end;
%length of all of the sections are lambda divided by sqrt(E_eff)
length=3e11/(cut_freq*8*sqrt(E_eff));
z_feed=50;
A=(z_feed/60)*sqrt((E_eff+1)/2)+(((E_eff-1)/(E_eff+1))*(.23+(.11/E_eff)));
B=377*pi/(2*z_feed)*sqrt(E_eff);
w1_feed=.1588*10*8*exp(A)/(exp(2*A)-2);
w2_feed=(.1588*10*2/pi)*(B-1-log(2*B-1)+((E_eff-1)/(2*E_eff))*(log(B-1)+0.39-0.61/E_eff));
if ((w1_feed<=2*1.588) && (w1_feed>0) && (imag(w1_feed)==0))
    w_feed=w1_feed;
elseif ((w2_feed>2*1.588) && (w2_feed>0) && (imag(w2_feed)==0))
    w_feed=w2_feed;
end;*/
			
			}else{//stepped impedance for lpf hpf
				//g values have been calculated, now calculating the capacitor and inductor values
		var w=2*Math.PI*fc;
		if(filter==1){//low pass 
			for(i=g.length-1;i>=0;i--)
				if(g[i][1]==0)//ind
					g[i][0]*=r0/w;
				else if(g[i][1]==1)//cap
					g[i][0]*=1/(r0*w);
				else if(g[i][1]==3)//res
					g[i][0]*=r0;
		}else if(filter==2){//high pass
			for(i=g.length-1;i>=0;i--)
				if(g[i][1]==0){//ind
					g[i][0]=1/(r0*w*g[i][0]);
					g[i][1]=1;
				}else if(g[i][1]==1){//cap
					g[i][0]=r0/(g[i][0]*w);
					g[i][1]=0;
				}else if(g[i][1]==3)//res
					g[i][0]*=r0;
		}//scaled
			}
		}else{//coupled for bp and br
		}
			
		
	});
});