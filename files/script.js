var response,filter,order,fc,bandwidth,ripple,r0,method,line,g,Er,delta;
$(document).ready(function(){
	$("#responseSelect").change(function(event){
		event.preventDefault();
		if($(this).val()==2)
			$("#frequency-table-append").after("<tr>\
							<td>Passband ripple (dB) :</td>\
							<td>\
								<input type=\"number\" name=\"ripple\" value=\"0.5\">\
							</td>\
						</tr>");
	});
	$("#filterSelect").change(function(event){
		event.preventDefault();
		if($(this).val()>2)
			$("#frequency-table-append").after("<tr>\
							<td>Bandwidth in percentage of Central Frequency:</td>\
							<td>\
								<input type=\"number\" value=\"0.1\" name=\"delta\" step=\"0.05\">\
							</td>\
						</tr>");
	});
	$(".scrollnext").click(function(event){
		event.preventDefault();
		$("#top-container").animate({"left":"-="+parseInt($("body").css("width"))}, 'slow');
		return false;
	});
	$("#frequency-submit").click(function(event){
		event.preventDefault();
		if($("#filterSelect").val()>2) $("#cut_off_text").html("Center");
		else  $("#cut_off_text").html("Cutoff");
	});
	$("#lumped-next").click(function(event){
		event.preventDefault();
		$("#container3").animate({"left":$("#container4").css("left")});
		$("#lumped-next-container").fadeOut();
	});
	
	$("#calculate-lumped").click(function(event){
		event.preventDefault();
		//get values
		response=$('#filter-form-container select[name=response]').val()//chebyshev r butterworth
		filter=$('#filter-form-container select[name=filter]').val()
		r0=$('#frequency-form-container input[name=r0]').val()
		order=$('#frequency-form-container input[name=order]').val()
		if($("#filterSelect").val()>2){
			bandwidth=$('#frequency-form-container input[name=delta]').val();
			bandwidth*=fc;
		}
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
		fc=$('#frequency-form-container input[name=fc]').val()*Math.pow(10,$('#frequency-form-container select[name=fc-unit]').val());
		g=new Array(),k=new Array();
		g[0]=[1,3];//type: 0=cap;1=ind,3=res;
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
			string+="<tr><td>g "+i+":</td><td>"+(com[g[i][1]]+": "+g[i][0])+"</td></tr>";
		}
		string+="</table>";
		$("#lumped-output").html(string);
		
		
	})
	$("#method-next").click(function(event){
		event.preventDefault();
		$("#container3").animate({"left":$("#container5").css("left")});
		//calculate circuit diagram
		Er=parseInt($("#method-form-container input[name=er]").val());
		if(filter<=2){
			method=$("#method-form-container select[name=method]").val();
			if(method==1){//stub for lpf hpf
				//k starts from 1, l for lpf, c for hpf
				var N=1+(1/g[1][0]),j,z_half;
				if(filter==1){
					for(i=g.length-2;i>0;i--){
					if(g[i][1]==0) { g[i][0]=(1/g[i][0]);}
					}
				k[1]=N;
				k[2]=g[1][0]*N;
				j=3;
				}else{
					for(i=g.length-2;i>0;i--){
					if(g[i][1]==1){
						g[i][0]=(1/g[i][0]);
						}
					}
						k[1]=N;
						k[2]=g[1][0]*N;
						j=3;
				}
				for(i=2;i<g.length-2;i++){
					if(i%2==1){
						z_half=g[i][0]/2;
						N=1+(1/z_half);
						k[j]=N*z_half;
						k[j+1]=0.5*N;
						k[j+2]=k[j];
						j=j+2;
					}else
						k[j]=g[i][0];
					j=j+1;
				}
				N=1+(1/g[i][0]);        
				k[j]=g[i][0]*N;
				k[j+1]=N;
				
				for(i=k.length-1;i>=0;i--)
					k[i]*=50;
				var A,B,w1,w2,w1_feed,w2_feed,z_feed,length,w_feed;
				for(i=1;i<=2*order-1;++i){
					A=((k[i]/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(0.23+(0.11/Er))));
					B=377*Math.PI/(2*k[i]*Math.sqrt(Er));
					w1=0.1588*10*8*Math.exp(A)/(Math.exp(2*A)-2);
					w2=(0.1588*10*2/Math.PI)*(B-1-Math.log(2*B-1)+((Er-1)/(2*Er))*(Math.log(B-1)+0.39-0.61/Er));
					if ((w1<=2*1.588) && (w1>0))
						k[i]=w1;
					else if ((w2>2*1.588) && (w2>0))
						k[i]=w2;
				}
				length=3e11/(fc*8*Math.sqrt(Er));
				z_feed=50;//feed
				A=(z_feed/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(0.23+(0.11/Er)));
				B=377*Math.PI/(2*z_feed)*Math.sqrt(Er);
				w1_feed=0.1588*10*8*Math.exp(A)/(Math.exp(2*A)-2);
				w2_feed=(0.1588*10*2/Math.PI)*(B-1-Math.log(2*B-1)+((Er-1)/(2*Er))*(Math.log(B-1)+0.39-0.61/Er));
				if ((w1_feed<=2*1.588) && (w1_feed>0))
					w_feed=w1_feed;
				else if ((w2_feed>2*1.588) && (w2_feed>0))
					w_feed=w2_feed;
				
				//drawing canvas
				
				var canvas=document.getElementById("microcanvas");
				var context = canvas.getContext('2d');
	  			canvas.width = $("#micro-output-output").width();
				canvas.height= 450;
				context.fillStyle="#FFFFFF";
	  			context.fillRect(0,0,canvas.width,canvas.height);
				context.fillStyle="#aa8833";
				x=20;
				y=1.8;
				context.font = "bold 16px sans-serif";
				var sx=canvas.width/(order*25),sy=canvas.height/30;
				for(i=1;i<=(2*order)-1;i++){
					if (i%2==1){
						context.fillStyle="#aa8833";
						context.fillRect(x*sx,y*sy,k[i]*sx,length*sy);
						context.fillStyle="#000000";
						context.fillText(Math.round(k[i]*1000)/1000,x*sx+20,y*sy+40);
						x=x+k[i]/2;
						y=y+length;
					}else{
						context.fillStyle="#aa8833";
					    context.fillRect(x*sx,y*sy,length*sx,k[i]*sy);
							context.fillStyle="#000000";
							context.fillText(Math.round(k[i]*1000)/1000,x*sx+20,y*sy+40);
					    x=x+length-(k[i+1]/2);
					    y=y-length;
					}
				}
				context.fillStyle="#bb9944";
				context.fillRect((20-length+k[1]/2)*sx,(1.8+length)*sy,length*sx,w_feed*sy);
				context.fillRect(x*sx,y*sy,length*sx,w_feed*sy);
				
			}else{//stepped impedance for lpf hpf
				//g values have been calculated, now calculating the capacitor and inductor values
				var w=2*Math.PI*fc;
				if(filter==1){//low pass 
					lamda_eff=(3e8)/(fc*Math.sqrt(Er));
					var length = new Array();
					var width = new Array();
					for(i=g.length-1;i>=0;i--){
						if(g[i][1]==1){//ind take w/h as 
							g[i][0]*=r0/w;
							length[i]=1000*lamda_eff*Math.asin(w*g[i][0]/100)/(2*Math.PI);
							width[i]=0.1588*0.2*10;
						}else if(g[i][1]==0){//cap
							g[i][0]*=1/(r0*w);
							length[i]=1000*lamda_eff*Math.asin(w*g[i][0]*20)/(2*Math.PI);
							width[i]=0.1588*0.8*10;
						}else if(g[i][1]==3){//res
							g[i][0]*=r0;
							length[i]=1;
							width[i]=0.1588*0.5*10;
						}
					}
					
				}else if(filter==2){//high pass
					lamda_eff=(3*Math.pow(10,8))/(w*Math.sqrt(Er));
					var length = new Array();
					var width = new Array();
					for(i=g.length-1;i>=0;i--)
						if(g[i][1]==0){//cap
							g[i][0]=1/(r0*w*g[i][0]);
							g[i][1]=1;
							length[i]=1000*lamda_eff*Math.asin(w*g[i][0]*20)/(2*Math.PI);
							width[i]=0.1588*.8*10;
						}else if(g[i][1]==1){//ind
							g[i][0]=r0/(g[i][0]*w);
							g[i][1]=0;
							length[i]=1000*lamda_eff*Math.asin(w*g[i][0]/100)/(2*Math.PI);
							width[i]=0.1588*.2*10;
						}else if(g[i][1]==3){//res
							g[i][0]*=r0;
							length[i]=1;
							width[i]=0.1588*.5*10;
						}
						for(i=g.length-1;i>=0;i--){
							length[i]*=10
							width[i]*=3
						}
				}
				
				
				var canvas=document.getElementById("microcanvas");
				var context = canvas.getContext('2d');
				canvas.width = $("#micro-output-output").width();
				canvas.height= 450;
				context.fillStyle="#FFFFFF";
				context.fillRect(0,0,canvas.width,canvas.height);
				x=20;
				y=0.05;
				offset=200
				context.font = "bold 16px sans-serif";
				var sx=canvas.width/(order*35),sy=canvas.height/10;
				i=1;
				context.fillStyle="#aa8833";
				context.fillRect(x*sx,y*sy+offset,length[i]*sx,width[i]*sy);
				context.fillStyle="#000000";
				context.fillText("w="+Math.round(width[i]*1000)/1000,x*sx+20,y*sy+80+offset);
				context.fillText("l="+Math.round(length[i]*1000)/1000,x*sx,y*sy+40+offset);
				for(i=2;i<=order;i++){
					x=x+length[i-1];
					y=y+(width[i-1]/2)-(width[i]/2);
					context.fillStyle="#aa8833";
					context.fillRect(x*sx,y*sy+offset,length[i]*sx,width[i]*sy);
					context.fillStyle="#000000";
					context.fillText("w="+Math.round(width[i]*1000)/1000,x*sx,y*sy+60+offset);
					context.fillText("l="+Math.round(length[i]*1000)/1000,x*sx,y*sy+40+offset);
					console.log(x,y,length[i],width[i])
				}
				context.fillStyle="#996611";
				var length_feed_lines=Math.max.apply( Math, length );
				var width_feed_lines=0.4*0.1588*10;
				context.fillRect((20-length_feed_lines)*sx,(0.05+(width[1]/2)-(width_feed_lines/2))*sy+offset,(length_feed_lines)*sx,width_feed_lines*sy);
				context.fillRect((x+length[order])*sx,(y+(width[order]/2)-(width_feed_lines/2))*sy+offset,length_feed_lines*sx,width_feed_lines*sy);
								
			}
		}else{//coupled for bp and br
			delta=$("#filter-form-container select[name=delta]").val();
			if(filter==3){//band pass
				var ZJ=new Array();
				//compute even mode and odd mode impedance
				ZJ[1]=Math.sqrt(Math.PI*delta/(2*g[1][0]));
				for(i=2;i>=g.length-1;i++){
					ZJ[i]=Math.PI*delta/(2*Math.sqrt(g[i-1][0]*g[i][0]));
				}
				var Z_oe = new Array();
				var Z_oo = new Array();
				var Z_ose = new Array();
				var Z_oso = new Array();
				for (i=1;i<g.length-1;i++){
					Z_oe[i]=r0*(1+ZJ[i]+(Math.pow(ZJ[i],2)));
					Z_oo[i]=r0*(1-ZJ[i]+(Math.pow(ZJ[i],2)));
					Z_ose[i]=Z_oe[i]/2;
					Z_oso[i]=Z_oo[i]/2;
				}

				//Implementation of Nomogram Equations to find the WIDTH and SPACING
				var w_hse=new Array()
				var w_hso=new Array()
				for(i=1;i<g.length-1;i++){
					var A=((Z_ose[i]/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(0.23+(0.11/Er))));
					var B=377*Math.PI/(2*Z_ose[i]*Math.sqrt(Er));
					var w1_hse=8*Math.exp(A)/(Math.exp(2*A)-2);
					var w2_hse=(2/Math.PI)*(B-1-Math.log(2*B-1)+((Er-1)/(2*Er))*(Math.log(B-1)+0.39-0.61/Er));
					if ((w1_hse<=2*1.588) && (w1_hse>0))
				    	w_hse[i]=w1_hse;
					else// if((w2_hse>2*1.588) && (w2_hse>0))
				    	w_hse[i]=w2_hse;
				}
				for(i=1;i<g.length-1;i++){
					var A=((Z_oso[i]/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(0.23+(0.11/Er))));
					var B=377*Math.PI/(2*Z_oso[i]*Math.sqrt(Er));
					var w1_hso=8*Math.exp(A)/(Math.exp(2*A)-2);
					var w2_hso=(2/Math.PI)*(B-1-Math.log(2*B-1)+((Er-1)/(2*Er))*(Math.log(B-1)+0.39-0.61/Er));
					if ((w1_hso<=2*1.588) && (w1_hso>0))
				    	w_hso[i]=w1_hso;
					else //if((w2_hso>2*1.588) && (w2_hso>0))
				    	w_hso[i]=w2_hso;
				}
				var s_h=new Array();
				var w_h=new Array();
				cosh=function(i){
					var a=Math.exp(i);
					return ((a+1/a)/(a-1/a));
				}
				
				for(i=1;i<g.length;i++){
					s_h[i]=(2/Math.PI)*cosh((cosh((Math.PI/2)*w_hse[i])+cosh((Math.PI/2)*w_hso[i])-2)/(cosh((Math.PI/2)*w_hso[i])-cosh((Math.PI/2)*w_hse[i])));
					w_h[i]=(1/Math.PI)*(cosh(.5*((cosh(Math.PI*.5*s_h[i])-1)+((cosh(Math.PI*.5*s_h[i])+1)*cosh(Math.PI*.5*w_hse[i]))))-(Math.PI*.5*s_h[i]));
					
				}

				var s=s_h*0.1588*10;
				var w=w_h*0.1588*10;
				var length=3e11/(fc*4*Math.sqrt(Er));

				var A=((r0/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(.23+(.11/Er))));

				
				//height of substrate of the microstrip design is assumed to be 1/16th of an inch
				var s=new Array();
				var w=new Array();
				for(i=1;i<g.length;i++){
					s[i]=s_h[i]*0.1588*10;
					w[i]=w_h[i]*0.1588*10;
				}
				var length=(3*Math.pow(10,11))/(fc*4*Math.sqrt(Er));
				console.log(s);
				console.log(w);
				//WIDTH of feedlines
				
				var A=((r0/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(0.23+(0.11/Er))));
				var B=377*Math.PI/(2*r0*Math.sqrt(Er));
				var w_feed1=0.1588*10*8*Math.exp(A)/(Math.exp(2*A)-2);
				var w_feed2=(0.1588*10*2/Math.PI)*(B-1-Math.log(2*B-1)+((Er-1)/(2*Er))*(Math.log(B-1)+0.39-0.61/Er));
				if ((w_feed1<=2*1.588) && (w_feed1>0))
				    w_feed=w_feed1;
				else if ((w_feed2>2*1.588) && (w_feed2>0))
				    w_feed=w_feed2;
				
<<<<<<< HEAD
							
var canvas=document.getElementById("microcanvas");
	var context = canvas.getContext('2d');
  canvas.width = $("#micro-output-output").width();
	canvas.height= 450;
	context.fillStyle="#FFFFFF";
  context.fillRect(0,0,canvas.width,canvas.height);
x=10;
y=5;
offset=10;
context.font = "bold 16px sans-serif";
var sx=canvas.width/(order*35),sy=canvas.height/10;
for(i=1;i<=order;i++){
	context.fillStyle="#aa8833";
context.fillRect(x*sx,y*sy+offset,length*sx,w[i]*sy);
y=y+w[i]+s[i];
context.fillRect(x*sx,y*sy+offset,length*sx,w[i]*sy);
x=x+length;
context.fillStyle="#000000";
context.fillText("w="+Math.round(w[i]*1000)/1000,x*sx+20,y*sy+80+offset);
	console.log(x,y,length,s[i],w[i])
}
context.fillStyle="#996611";
var length_feed_lines=Math.max.apply( Math, length );
var width_feed_lines=0.4*0.1588*10;
context.fillRect((20-length_feed_lines)*sx,(0.05+(width[1]/2)-(width_feed_lines/2))*sy+offset,(length_feed_lines)*sx,width_feed_lines*sy);
context.fillRect((x+length[order])*sx,(y+(width[order]/2)-(width_feed_lines/2))*sy+offset,length_feed_lines*sx,width_feed_lines*sy);

y=y+w[order]-w[order+1];
context.fillRect(x*sx,y*sy+offset,length*sx,w[order+1]*sy)
y=y+w[order+1]+s[order+1];
context.fillRect(x*sx,y*sy+offset,length*sx,w[order+1]*sy)
context.fillRect((10-length)*sx,(5+w[1]-w_feed)*sy+offset,length*sx,w_feed*sy)
context.fillRect((x+length)*sx,y*sy,length*sx,w_feed*sy)

				
=======
				//drawing canvas
				var canvas=document.getElementById("microcanvas");
				var context = canvas.getContext('2d');
  				canvas.width = $("#micro-output-output").width();
				canvas.height= 450;
				context.fillStyle="#FFFFFF";
  				context.fillRect(0,0,canvas.width,canvas.height);
				context.fillStyle="#aa8833";
				x=20;
				y=1.8;
				context.font = "bold 16px sans-serif";
				//var sx=canvas.width/(order*25),sy=canvas.height/30;
				for(i=1;i<=(2*order)-1;i++){
					/*if (i%2==1){
						context.fillStyle="#aa8833";
						context.fillRect(x*sx,y*sy,k[i]*sx,length*sy);
						context.fillStyle="#000000";
						context.fillText(Math.round(k[i]*1000)/1000,x*sx+20,y*sy+40);
						x=x+k[i]/2;
						y=y+length;
					}else{
						context.fillStyle="#aa8833";
	    				context.fillRect(x*sx,y*sy,length*sx,k[i]*sy);
						context.fillStyle="#000000";
						context.fillText(Math.round(k[i]*1000)/1000,x*sx+20,y*sy+40);
	    				x=x+length-(k[i+1]/2);
	    				y=y-length;
					}*/
					//console.log(sx,sy,x,y,k[i],length,x*sx)
				}
				context.fillStyle="#bb9944";
				//xlabel('Length in mm','fontsize',12,'fontweight','b');
				//ylabel('Width in mm','fontsize',12,'fontweight','b');
				//context.fillRect((20-length+k[1]/2)*sx,(1.8+length)*sy,length*sx,w_feed*sy);
				//context.fillRect(x*sx,y*sy,length*sx,w_feed*sy);
>>>>>>> 98b18e558766a7d2a0ecebf27953ccf4f1e7dc30
			
			}else{//band stop
				
			}
		}
			
		
	});
});