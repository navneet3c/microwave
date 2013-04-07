var response,filter,order,fc,ripple,r0,method,line,g,Er,delta,z_high,z_low;
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
			//bandwidth=parseFloat($('#frequency-form-container input[name=delta]').val());
			//bandwidth*=fc;
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
					B=60*Math.PI*Math.PI/(k[i]*Math.sqrt(Er));
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
				B=60*Math.PI*Math.PI/(z_feed*Math.sqrt(Er));
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
				B=60*Math.PI*Math.PI/(z_feed*Math.sqrt(Er));
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
							length[i]=g[i][0]*z_low*beta/(r0*3e8*10);// divide by 2 for displaying properly. value dowsnt matter
						}
				A=(z_feed/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(0.23+(0.11/Er)));
				B=60*Math.PI*Math.PI/(z_feed*Math.sqrt(Er));
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
				x=1;
				offset=canvas.height/4;
				context.font = "bold 10px sans-serif";
				var length_feed_lines=Math.max.apply( Math, length );
				var width_feed_lines=Math.max.apply( Math, width )
				var sx=canvas.width/((order+1)*length_feed_lines),sy=canvas.height/(width_feed_lines*2);
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
			delta=parseFloat($("#frequency-form-container input[name=delta]").val());
			var ZJ=new Array();
			if(filter==3){//band pass
				//compute even mode and odd mode impedance
				ZJ[1]=Math.sqrt(Math.PI*delta/(2*g[1][0]*g[0][0]));
				for(i=2;i<=g.length-2;i++){
					ZJ[i]=Math.PI*delta/(2*Math.sqrt(g[i-1][0]*g[i][0]));
				}
				ZJ[i]=Math.sqrt(Math.PI*delta/(2*g[i-1][0]*g[i][0]));
			}else{//band stop
				ZJ[1]=Math.sqrt(Math.PI/(2*delta*g[1][0]*g[0][0]));
				for(i=2;i<=g.length-2;i++){
					ZJ[i]=Math.PI/(2*delta*Math.sqrt(g[i-1][0]*g[i][0]));
				}
				ZJ[i]=Math.sqrt(Math.PI/(delta*2*g[i-1][0]*g[i][0]));
			}
				//Implementation of Nomogram Equations to find the WIDTH and SPACING
				var d,z_o,w_hse,w_hso;
				var s=new Array();
				var w=new Array();
				var s_h=new Array();
				var w_h=new Array();
				function cosh(arg){
					var a=Math.exp(arg);
					return ((a+1/a)/2);
				}
				function acosh(arg){
					return Math.log(arg + Math.sqrt(arg * arg - 1));
				}
				for(i=1;i<g.length;i++){
					z_o=r0*(1+ZJ[i]+(Math.pow(ZJ[i],2)));
					d=60*Math.PI*Math.PI/(z_o*Math.sqrt(Er));
					w_hse=(2/Math.PI)*(d-1)-(2/Math.PI)*Math.log(2*d-1)+(Er-1)*(Math.log(d-1)+0.293-0.517/Er)/(Math.PI*Er);
					
					z_o=r0*(1-ZJ[i]+(Math.pow(ZJ[i],2)));
					d=60*Math.PI*Math.PI/(z_o*Math.sqrt(Er));
					w_hso=(2/Math.PI)*(d-1)-(2/Math.PI)*Math.log(2*d-1)+(Er-1)*(Math.log(d-1)+0.293-0.517/Er)/(Math.PI*Er);
					
					s_h[i]=(2/Math.PI)*acosh((cosh((Math.PI/2)*w_hse)+cosh((Math.PI/2)*w_hso)-2)/(cosh((Math.PI/2)*w_hso)-cosh((Math.PI/2)*w_hse)));
					w_h[i]=(1/Math.PI)*(acosh(0.5*((cosh(Math.PI*0.5*s_h[i])-1)+((cosh(Math.PI*0.5*s_h[i])+1)*cosh(Math.PI*0.5*w_hse))))-(Math.PI*0.5*s_h[i]));
					console.log(z_o,d,w_hso,w_hse,s_h[i],w_h[i],Math.log(2*d-1)+(Er-1)*(Math.log(d-1)+0.293-0.517/Er))
				}
				for(i=1;i<g.length;i++){
					s[i]=s_h[i]*0.1588*10;
					w[i]=w_h[i]*0.1588*10;
				}
				var length=3e11/(fc*4*Math.sqrt(Er));
				var A=((r0/60)*Math.sqrt((Er+1)/2)+(((Er-1)/(Er+1))*(0.23+(0.11/Er))));
				var B=60*Math.PI*Math.PI/(r0*Math.sqrt(Er));
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
				offset=canvas.height/8;
				context.font = "bold 10px sans-serif";
				var length_feed_lines=length;
				w[0]=0;s[0]=0;
				var width_feed_lines=Math.max.apply( Math, w )
				var sx=canvas.width/((order+3)*length_feed_lines),sy=canvas.height/(width_feed_lines*order*3);
				y=0.5;x=1;
				context.fillStyle="#996611";
				context.fillRect(x*sx,y*sy+offset,length*sx/2,w[order+1]*sy);
				x=x+length/2;
				for(i=1;i<=order;i++){
					context.fillStyle="#aa8833";
					context.fillRect(x*sx,y*sy+offset,length*sx,w[i]*sy);
					context.fillStyle="#000000";
					context.fillText("w="+Math.round(w[i]*1000)/1000,x*sx+20,y*sy+10+offset);
					y=y+w[i]+s[i];
					context.fillStyle="#aa8833";
					context.fillRect(x*sx,y*sy+offset,length*sx,w[i]*sy);
					context.fillStyle="#000000";
					context.fillText("s="+Math.round(s[i]*1000)/1000,x*sx+20,y*sy+offset);
					x=x+length;
					console.log(sx,sy,x,y,s[i],w[i],w,width_feed_lines) 
				}
				context.fillStyle="#aa8833";
				y=y+w[order]-w[order+1];
				context.fillRect(x*sx,y*sy+offset,length*sx,w[order+1]*sy);
				context.fillStyle="#000000";
				context.fillText("w="+Math.round(w[i]*1000)/1000,x*sx+20,y*sy+10+offset);
				y=y+w[order+1]+s[order+1];
				context.fillStyle="#aa8833";
				context.fillRect(x*sx,y*sy+offset,length*sx,w[order+1]*sy);
				context.fillStyle="#000000";
				context.fillText("s="+Math.round(s[i]*1000)/1000,x*sx+20,y*sy+offset);
				
				context.fillStyle="#996611";
				x=x+length;
				context.fillRect(x*sx,y*sy+offset,length*sx/2,w[order+1]*sy);
			
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
