var response,filter,order,fc,bandwidth,ripple,r0,method,line,g,Er,delta,z_high,z_low;
$(document).ready(function(){
	$("#responseSelect").change(function(event){
		event.preventDefault();
		if($(this).val()==2)
			$("#frequency-table-append").after("<tr>\
							<td>Passband ripple (dB) :</td>\
							<td>\
								<input type=\"number\" name=\"ripple\" value=\"3\">\
							</td>\
						</tr>");
	});
	$("#filterSelect").change(function(event){
		event.preventDefault();
		if($(this).val()>2){
			if($("#band-central").length === 0)
			$("#frequency-table-append").after("<tr id=\"band-central\">\
							<td>Bandwidth in percentage of Central Frequency:</td>\
							<td>\
								<input type=\"number\" value=\"0.1\" name=\"delta\" step=\"0.05\">\
							</td>\
						</tr>");
		} else {
			if($("#band-central").length !== 0)
				$("#band-central").remove();
		}
	});
	$("#frequency-submit").click(function(event){
		event.preventDefault();
		if($("#filterSelect").val()>2) $("#cut_off_text").html("Center");
		else  $("#cut_off_text").html("Cutoff");
	});
	$("#calculate-lumped").click(function(event){
		event.preventDefault();
		//get values
		response=$('#filter-form-container select[name=response]').val()//chebyshev r butterworth
		filter=$('#filter-form-container select[name=filter]').val()
		r0=parseInt($('#frequency-form-container input[name=r0]').val());
		order=parseInt($('#frequency-form-container input[name=order]').val())
		if($("#filterSelect").val()>2){
			bandwidth=parseFloat($('#frequency-form-container input[name=delta]').val());
			bandwidth*=fc;
			if($("#dis-type").length !== 0){
				$("#dis-type").remove();
			}
		}
		else{
			if($("#dis-type").length === 0){
				$("#method-table-append").after("<tr id=\"dis-type\">\
								<td>Type of design:</td>\
								<td>\
									<select size=\"1\" name=\"method\">\
										<option value=\"1\" selected>Stub Method</option>\
										<option value=\"2\">Stepped-Impedance Method</option>\
									</select>\
								</td>\
							</tr>");
			}
		}
		fc=parseFloat($('#frequency-form-container input[name=fc]').val())*Math.pow(10,$('#frequency-form-container select[name=fc-unit]').val());

		g=new Array(),k=new Array();
		g[0]=[1,3];//type: 0=cap;1=ind,3=res;
		if(response==1){//butterworth g
			for(i=1;i<=order;++i){
				g[i]=[2*Math.sin((2*i-1)*Math.PI/(2*order)),i%2];
			}
			g[i]=[1,3];
		}else{//chebychev g
			ripple=parseFloat($('#frequency-form-container input[name=ripple]').val())
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
		
			string+="<tr><td>g "+i+":</td><td>"+(com[g[i][1]]+": "+Math.round(g[i][0]*10000)/10000)+"</td></tr>";
		}
		string+="</table>";
		$("#lumped-output").html(string);
		
		
	})
	$("#lumped-next").click(function(event){
		event.preventDefault();
		$("#lumped-next-container").fadeOut();
	});
	$("#method-next").click(function(event){
		event.preventDefault();
		//$("#container3").animate({"left":$("#container5").css("left")});
		//calculate circuit diagram
		Er=parseFloat($("#method-form-container input[name=er]").val());
		z_high=parseInt($("#method-form-container input[name=zhigh]").val());
		z_low=parseInt($("#method-form-container input[name=zlow]").val());
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
				}else{
				for(i=g.length-2;i>0;i--){
					if(g[i][1]==0) { g[i][0]=(1/g[i][0]);}
					}
				k[1]=N;
				k[2]=g[1][0]*N;
				j=3;
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
					
				}
				for(i=k.length-1;i>0;i--){
					k[i]*=50;
				}
				k[0]=50;
				k[k.length]=50;
				//h=0.1588=1/16 of inch
				var A,B,w1,w2,w1_feed,w2_feed,z_feed,length,w_feed;
				for(i=0;i<=2*order;++i){
					A=((k[i]/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(0.23+(0.11/Er))));
					B=377*Math.PI/(2*k[i]*Math.sqrt(Er));
					w1=0.1588*10*8*Math.exp(A)/(Math.exp(2*A)-2);
					w2=(0.1588*10*2/Math.PI)*(B-1-Math.log(2*B-1)+((Er-1)/(2*Er))*(Math.log(B-1)+0.39-0.61/Er));
					if (w1<=2*1.588)
						k[i]=w1;
					else
						k[i]=w2;
				}
				length=3e11/(fc*8*Math.sqrt(Er));
				z_feed=r0;//feed
				A=(z_feed/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(0.23+(0.11/Er)));
				B=377*Math.PI/(2*z_feed)*Math.sqrt(Er);
				w1_feed=0.1588*10*8*Math.exp(A)/(Math.exp(2*A)-2);
				w2_feed=(0.1588*10*2/Math.PI)*(B-1-Math.log(2*B-1)+((Er-1)/(2*Er))*(Math.log(B-1)+0.39-0.61/Er));
				if (w1_feed<=2*1.588)
					w_feed=w1_feed;
				else
					w_feed=w2_feed;
				//drawing canvas
				
				
				var canvas=document.getElementById("microcanvas");
				var context = canvas.getContext('2d');
				canvas.width = 520;
				canvas.height= 400;
				context.fillStyle="#FFFFFF";
				context.fillRect(0,0,canvas.width,canvas.height);
				x=5;
				offset=canvas.height/5;
				context.font = "bold 10px sans-serif";
				var length_feed_lines=Math.max.apply( Math, k );
				var width_feed_lines=length
				var sx=canvas.width/(order*length*2.5),sy=canvas.height/(width_feed_lines*2.5);
				context.fillStyle="#996611";
				y=0.5;
				context.fillRect(x*sx,y*sy+offset,length*sx,sy);
				y=1;
				for(i=1;i<2*order;i++){
				if(i%2==1){
					x=x+length;
					context.fillStyle="#aa8833";
					context.fillRect(x*sx,y*sy+offset,k[i]*sx,length*sy);
					context.fillStyle="#000000";
					context.fillText("w="+Math.round(k[i]*1000)/1000,x*sx+5,y*sy+40+offset);
				}else{
					x=x+k[i-1];
					context.fillStyle="#aa8833";
					context.fillRect(x*sx,y*sy+offset,length*sx,k[i]*sy);
					context.fillStyle="#000000";
					context.fillText("w="+Math.round(length*1000)/1000,x*sx+5,y*sy-10+offset);
				}
				}
				context.fillStyle="#996611";
				if(i%2==1)
					x=x+length;
				else
					x=x+k[i-1];
				y=0.5;
				context.fillRect(x*sx,y*sy+offset,length*sx,sy);
				
			}else{//stepped impedance for lpf hpf
				var w=2*Math.PI*fc;
				var z_feed,w1_feed,w2_feed;
				var length = new Array();
				var beta=(fc*Math.sqrt(Er)*2*Math.PI)
				var width = new Array();
				if(filter==1){//low pass 
					for(i=g.length-1;i>=0;i--){
						if(g[i][1]==0){//ind
							z_feed=z_high;
							length[i]=g[i][0]*r0*beta/(z_feed*3e8);
						}else if(g[i][1]==1){//cap
							z_feed=z_low;
							length[i]=g[i][0]*z_feed*beta/(r0*3e8);
						}else if(g[i][1]==3){//res
							z_feed=r0;
							length[i]=g[i][0]*z_low*beta/(r0*3e8);
						}
				A=(z_feed/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(0.23+(0.11/Er)));
				B=377*Math.PI/(2*z_feed)*Math.sqrt(Er);
				w1_feed=1.6*8*Math.exp(A)/(Math.exp(2*A)-2);
				w2_feed=(1.6*2/Math.PI)*(B-1-Math.log(2*B-1)+((Er-1)/(2*Er))*(Math.log(B-1)+0.39-0.61/Er));
				if (w1_feed<=2*1.6*10 && w1_feed>0)
					width[i]=w1_feed;
				else
					width[i]=w2_feed;
					}
				}else if(filter==2){//high pass
					for(i=g.length-1;i>=0;i--){
						if(g[i][1]==1){//cap becomes ind
							z_feed=z_high;
							length[i]=10*r0*beta/(w*g[i][0]*z_feed*3);
						}else if(g[i][1]==0){//ind becomes cap
							z_feed=z_low;
							length[i]=10*z_feed*beta/(r0*w*g[i][0]*3);
						}else if(g[i][1]==3){//res
							z_feed=r0;
							length[i]=g[i][0]*z_low*beta/(r0*3e8);
						}
				A=(z_feed/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(0.23+(0.11/Er)));
				B=377*Math.PI/(2*z_feed)*Math.sqrt(Er);
				w1_feed=1.6*8*Math.exp(A)/(Math.exp(2*A)-2);
				w2_feed=(1.6*2/Math.PI)*(B-1-Math.log(2*B-1)+((Er-1)/(2*Er))*(Math.log(B-1)+0.39-0.61/Er));
				if (w1_feed<=2*1.6*10 && w1_feed>0)
					width[i]=w1_feed;
				else
					width[i]=w2_feed;
					}
				}
				
				
				var canvas=document.getElementById("microcanvas");
				var context = canvas.getContext('2d');
				canvas.width = 520;
				canvas.height= 400;
				context.fillStyle="#FFFFFF";
				context.fillRect(0,0,canvas.width,canvas.height);
				x=5;
				offset=canvas.height/4;
				context.font = "bold 10px sans-serif";
				var length_feed_lines=Math.max.apply( Math, length );
				var width_feed_lines=Math.max.apply( Math, width )
				var sx=canvas.width/(order*length_feed_lines),sy=canvas.height/(width_feed_lines*2);
				context.fillStyle="#996611";
				y=(width_feed_lines-width[0])/2;
				context.fillRect(x*sx,y*sy+offset,length[0]*sx,width[0]*sy);
				for(i=1;i<=order;i++){
					x=x+length[i-1];
					y=y+(width[i-1]/2)-(width[i]/2);
					context.fillStyle="#aa8833";
					context.fillRect(x*sx,y*sy+offset,length[i]*sx,width[i]*sy);
					context.fillStyle="#000000";
					context.fillText("w="+Math.round(width[i]*1000)/1000,x*sx+5,y*sy+40+offset);
					context.fillText("l="+Math.round(length[i]*1000)/1000,x*sx+5,y*sy+60+offset);
				}
				context.fillStyle="#996611";
				x=x+length[i-1];
				y=y+(width[i-1]/2)-(width[i]/2);
				context.fillRect(x*sx,y*sy+offset,length[i]*sx,width[i]*sy);
			}
		}else{//coupled for bp and br
			delta=parseFloat($("#filter-form-container select[name=delta]").val());
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
				//WIDTH of feedlines
				
				var A=((r0/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(0.23+(0.11/Er))));
				var B=377*Math.PI/(2*r0*Math.sqrt(Er));
				var w_feed1=0.1588*10*8*Math.exp(A)/(Math.exp(2*A)-2);
				var w_feed2=(0.1588*10*2/Math.PI)*(B-1-Math.log(2*B-1)+((Er-1)/(2*Er))*(Math.log(B-1)+0.39-0.61/Er));
				if ((w_feed1<=2*1.588) && (w_feed1>0))
				    w_feed=w_feed1;
				else if ((w_feed2>2*1.588) && (w_feed2>0))
				    w_feed=w_feed2;
				

var canvas=document.getElementById("microcanvas");
	var context = canvas.getContext('2d');
  canvas.width = 520;
	canvas.height= 400;
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

				//drawing canvas
				var canvas=document.getElementById("microcanvas");
				var context = canvas.getContext('2d');
  				canvas.width = 460;
				canvas.height=320;
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

				context.fillStyle="#bb9944";
			
			}else{//band stop
				
			}
		}
			
		
	});
});


$(function(){
	var container = $(".container");
	var cache = {};
	window.H = 0;
	window.W = 0;
	window.page = 1;
	var C = function(i) {
		if(typeof cache["container"+i] !== "undefined")
			return cache["container"+i];
		return cache["container"+i] = $("#container"+i);
	};
	var alterspacing = function(){
		var height = $(window).height();
		var width = $(window).width();
		window.H = height;
		window.W = width;
		var i=0;
		container.each(function(){ 
			$(this).height(height*0.80); 
			$(this).css({left : i*width});
			$(this).hide();
			i++;
		});
		C(window.page).show();
		if(window.page>3){
			//create a new div to hold g values
		}
	};
	alterspacing();
	$(window).resize(alterspacing);

	var submithandler = function(options) {
		return function(e){
			e.preventDefault();
			
			C(window.page+options.to).show(250);
			$("#top-container").animate({"left":options.op+window.W},150,function(){
				C(window.page).hide(function(){
					$("#top-container").css("left","0px");
					window.page+=options.to;
				});
			});
		}
	};
	container.find(".scrollnext").click(submithandler({
		"to":1,
		"op":"-=",
	}));
	container.find(".scrollback").click(submithandler({
		"to":-1,
		"op":"+="
	}))
});
