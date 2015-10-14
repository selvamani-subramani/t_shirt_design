var tshirts = {};
var t_color = "";
var t_font = "sans-serif";
var preview_width = 440;
var preview_height = 280;
var tshirt_logo_position = "tshirt-image-center";
var typingTimer; //timer identifier
var doneTypingInterval = 1200; //time in ms, 1.2 second for example
var players_count = 0;

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}



// Top Item select
tshirts.item_select = function() {
  $(".select-design").find("input").not("#add_nos_front").change(function(event) {
    if (!$(this).prop('checked')) {
      $("#text-preview-area").addClass("low-opacity");
      $("#shirt-preview-area .dataImage").remove();
      $("#shirt-preview-area").removeClass("pcenter").removeClass("pleft").removeClass("pright");
      $("#shirt-preview-area").addClass("big-number-font");
      return false;
    } else {
      var klass = $(".shirt-position .position-selected");
      if (klass.hasClass("tshirt-image-left")) {
        $("#shirt-preview-area").addClass("pleftl");
      } else if (klass.hasClass("tshirt-image-center")) {
        $("#shirt-preview-area").addClass("pcenter");
      } else if (klass.hasClass("tshirt-image-right")) {
        $("#shirt-preview-area").addClass("pright");
      }
      $("#text-preview-area").removeClass("low-opacity");
      $("#add_names, #add_logo, #add_decal").not($(this)).prop('checked', false);
    }
    var id = $(this).attr("id");
    master_action(id);
  })

  function set_empyt_box() {
    $(".text-edit, .add-logo, .text-decimal").addClass("hidden");
    $("#text_content").empty();
  }

  function master_action(id) {
    if (id == "add_names") {
      set_empyt_box();
      $("#text_content").append("<span></span>");
      tshirts.enter_text();
      $(".text-edit").removeClass("hidden");
    } else if (id == "add_logo") {
      tshirts.reset_preview_box();
      set_empyt_box();
      if ($('#fileupload').val() == "") {
        $("#shirt-preview-area .dataImage").remove();
      }
      $("#text_content").append("<img src='' />")
      $(".add-logo").removeClass("hidden");
      tshirts.change_image();
    } else if (id == "add_decal") {
      tshirts.reset_preview_box();
      set_empyt_box();
      $("#text_content").append("<img src='' />");
      $("#text_content").append("<p class='top-text'></p>").append("<p class='bottom-text'></p>");
      $(".text-decimal").removeClass("hidden");
      tshirts.change_image_and_text();
    }

  }

}

//Option 1 Edit setting
tshirts.change_enter_text = function() {
  $(".preview-property select").on('change', function() {
    if ($(this).hasClass("display-fonts")) {
      t_font = $(this).val();
    }
    tshirts.enter_text();
  })
  $(".text-edit textarea").on('keyup', function() {
    clearTimeout(typingTimer);
    if ($(this).val) {
      typingTimer = setTimeout(tshirts.enter_text, doneTypingInterval);
    }
  })

  $(".text-edit .color-icons li").on('click', function() {
    t_color = "#" + $(this).text();
    tshirts.enter_text();
  })
}

tshirts.enter_text = function() {

  var t_align = $("#fontp").val();
  var t_spacing = $("#fonti").val();
  txt_span = $("#text_content span")

  if (txt_span.hasClass("text-set-position")) {
    txt_span.removeClass("text-set-position");
  }

  txt_span.text("");
  $("#text_content").css({
    "color": t_color,
    "font-family": t_font,
    "padding": t_spacing + "px",
    "width": preview_width - (t_spacing * 2) + "px",
    "height": preview_height - (t_spacing * 2) + "px"
  });


  multi_text = encodeURI($(".text-edit textarea").val()).replace(/%0A/g, "</br>");
  $("#text_content span").html(decodeURI(multi_text)).bigText({
    textAlign: t_align
  });

  if (txt_span.width() < txt_span.parent().width()) {
    txt_span.addClass("text-set-position");
  }

  tshirts.apply_canvas_to_tshirt();
}

//

//Option 2 Edit setting
tshirts.change_image = function() {
  tshirts.update_image($('#fileupload')[0])
  $('#fileupload').off("change").on('change', function() {
    tshirts.update_image(this)
  })
  $(".add-logo .color-icons li").off("click").on('click', function() {
    t_color = "#" + $(this).text();
    tshirts.change_image_color($("#text_content img")[0])
    tshirts.apply_canvas_to_tshirt();
  });
}

tshirts.update_image = function(input) {
  tshirts.reset_preview_box();
  var reader = new FileReader();

  reader.onload = function(e) {
    $("#text_content img").attr("src", e.target.result);
    // tshirts.change_image_color($("#text_content img")[0]);
    tshirts.apply_canvas_to_tshirt();
  }

  if (input.files && input.files[0]) {
    reader.readAsDataURL(input.files[0]);
  } else if ($(input).data("image")) {
    $("#text_content img").attr("src", $(input).data("image"));
    tshirts.apply_canvas_to_tshirt();
  }
}

//

//Option 3 Edit setting
tshirts.change_image_and_text = function() {
  //setup before functions

  $(".text-decimal select").on('change', function() {
    if ($(this).hasClass("display-fonts")) {
      t_font = $(this).val();
    }
    tshirts.update_image_and_text();
  })

  $(".text-decimal .color-icons li").on('click', function() {
    t_color = "#" + $(this).text();
    tshirts.change_image_color($("#text_content img")[0])
  })

  $("#decalTextA, #decalTextB").keyup(function() {
    clearTimeout(typingTimer);
    if ($(this).val) {
      typingTimer = setTimeout(tshirts.update_image_and_text, doneTypingInterval);
    }
  });

  tshirts.ajax_load_images();
  tshirts.update_image_and_text();

}


tshirts.ajax_load_images = function() {
  $(".text-decimal .image-box").off("click").on("click", function() {
    $(".text-decimal .load-images").toggleClass("hidden")
  })
  $(".text-decimal .load-images").off("click").on("click", "img", function() {
    image_data = $(this).attr("src");
    $(".text-decimal .image-box img").attr("src", image_data);
    $(".text-decimal .load-images").toggleClass("hidden");
    tshirts.update_image_and_text();
    tshirts.change_image_color($("#text_content img")[0]);
  })
}

tshirts.update_image_and_text = function() {

  var data = $(".text-decimal .image-box img").attr("src");

  $("#text_content img").attr("src", data).unbind("load").load(function() {

    $("#text_content").css({
      "color": t_color,
      "font-family": t_font
    });

    var t_position = $(".text-decimal .text-top .text-position").val();
    var b_position = $(".text-decimal .text-bottom .text-position").val();

    $("#text_content p.top-text").text($("#decalTextA").val());
    $("#text_content p.bottom-text").text($("#decalTextB").val());

    var text_height = $("#text_content p.top-text").height();
    var text_content = $("#text_content").height();
    var middle_height = (text_content / 2) - (text_height / 2);
    var end_height = text_content - text_height;
    var set_t = 0;
    var set_b = 0;
    if (t_position == b_position) {
      if (t_position == "top") {
        set_t = 0;
        set_b = text_height + 5 + set_t;
      } else if (t_position == "middle") {
        set_t = (text_content / 2) - text_height
        set_b = (text_content / 2)
      } else if (t_position == "bottom") {
        set_t = text_content - (text_height * 2)
        set_b = text_content - text_height
      }
    } else {
      if (t_position == "top") {
        set_t = 0;
      } else if (t_position == "middle") {
        set_t = middle_height
      } else if (t_position == "bottom") {
        set_t = end_height
      }

      if (b_position == "top") {
        set_b = 0;
      } else if (b_position == "middle") {
        set_b = middle_height
      } else if (b_position == "bottom") {
        set_b = end_height
      }
    }

    $("#text_content p.top-text, #text_content p.bottom-text").removeAttr("style");

    var top_bottom = $(".text-decimal .text-top .test-design").val();
    var rotate_top_value = tshirts.rotate_text(top_bottom, "top");
    var bottom_bottom = $(".text-decimal .text-bottom .test-design").val();
    var rotate_bottom_value = tshirts.rotate_text(bottom_bottom, "bottom");

    if (rotate_top_value != false) {
      $("#text_content p.top-text").css("transform", rotate_top_value);
    }
    if (rotate_bottom_value != false) {
      $("#text_content p.bottom-text").css("transform", rotate_bottom_value);
    }

    $("#text_content p.top-text").css("top", set_t + "px");
    $("#text_content p.bottom-text").css("top", set_b + "px");

    tshirts.apply_canvas_to_tshirt();
  });
  tshirts.change_image_color($("#text_content img")[0]);
}

tshirts.rotate_text = function(line, pos) {
  t_selector = ""
  if (pos == "top") {
    t_selector = $("#text_content .top-text");
  } else if (pos == "bottom") {
    t_selector = $("#text_content .bottom-text")
  }

  width = t_selector.width();
  height = t_selector.height();
  tshirts.text_curve_destory(t_selector, false);

  if (line == "line1") {
    return false
  } else if (line == "line2") {
    return "matrix(1, 0.4, -0.4, 1, -" + (width / 2) + ", 5)";
  } else if (line == "line3") {
    return "matrix(1, -0.4, 0.4, 1, -" + (width / 2) + ", 5)";
  } else if (line == "line4") {
    tshirts.text_curve_top(t_selector, false);
  } else if (line == "line5") {
    tshirts.text_curve_bottom(t_selector, false);
  }

}


//

//Option 4 Select number
tshirts.select_number = function() {
  console.log("sd")
  $("#add_nos_front").click(function() {
    execute_checkbox(this)
  })

  function execute_checkbox(id) {
    if ($(id).prop('checked')) {
      $(".shirt-position").addClass("add-number");
      $("#shirt-preview-area").addClass("display-number").append("<span>12</span>").find("span").css("color", t_color);;
    } else {
      $(".shirt-position").removeClass("add-number");
      $("#shirt-preview-area").removeClass("display-number").find("span").remove();
    }
  }
  execute_checkbox("#add_nos_front");
  $(".display-number .small-number").click(function() {
    $("#shirt-preview-area").removeClass("big-number-font");
  })
  $(".display-number .big-number").click(function() {
    $("#shirt-preview-area").addClass("big-number-font");
  })
}

// 


// Box 3 select logo position over tshirt
tshirts.logo_position_click_event = function() {
  $(".shirt-position .tshirt-image-left").click(function() {
    tshirt_logo_position = "tshirt-image-left"
    tshirts.set_logo_position("left");
  })
  $(".shirt-position .tshirt-image-center").click(function() {
    tshirt_logo_position = "tshirt-image-center"
    tshirts.set_logo_position("center");
  })
  $(".shirt-position .tshirt-image-right").click(function() {
    tshirt_logo_position = "tshirt-image-right"
    tshirts.set_logo_position("right");
  })
}

tshirts.set_logo_position = function(place) {
  $(".shirt-position").find(".position-selected").removeClass("position-selected");
  $(".shirt-position").find("." + tshirt_logo_position).addClass("position-selected");
  $("#shirt-preview-area").removeClass().addClass("p" + place)
}

//

tshirts.apply_canvas_to_tshirt = function() {
  $("#shirt-preview-area .dataImage").remove();
  html2canvas($("#text_content"), {
    onrendered: function(canvas) {
      //$("#shirt-preview-area").append(canvas);
      // var context = canvas.getContext("2d");
      // context.fillStyle = "red";
      imgData = canvas.toDataURL("image/png");
      $("#shirt-preview-area").prepend("<img class='dataImage' src=''>")
      $("#shirt-preview-area img").attr("src", imgData);
      $("#shirt-preview-area").find("span").css("color", t_color);
    }
  });
}

tshirts.reset_preview_box = function() {
  var i_spacing = 0;
  $("#text_content").css({
    "padding": i_spacing + "px",
    "width": preview_width - (i_spacing * 2) + "px",
    "height": preview_height - (i_spacing * 2) + "px"
  });
}

tshirts.back_text_display_rule = function() {
  $("#add_back_name").change(function(event) {
    $("#text_content h3").toggleClass("hidden");
    tshirts.apply_canvas_to_tshirt();
  })
  $("#add_number").change(function(event) {
    $("#text_content h2").toggleClass("hidden");
    tshirts.apply_canvas_to_tshirt();
  })
  $("#add_com_text").change(function(event) {
    $("#text_content span").toggleClass("hidden");
    tshirts.apply_canvas_to_tshirt();
  })
}

tshirts.back_set_style = function() {
  $(".select-back-style .display-fonts").change(function() {
    t_font = $(this).val();
    // $("#tblSizes tbody tr.selected .text_font").val(t_font);
    tshirts.back_set_design();
  });
  $(".select-back-style .color-icons li").on('click', function() {
    t_color = "#" + $(this).text();
    // $("#tblSizes tbody tr.selected .text_color").val($(this).text());
    tshirts.back_set_design();
  })
}

tshirts.back_name_position = function() {
  if ($(".back-shirt-position .layout_curved").hasClass("position-selected")) {
    tshirts.text_curve_top($("#text_content h3"), false);
  }
  $(".back-shirt-position .layout_curved, .back-shirt-position .layout_straight_top").click(function() {
    $(".back-shirt-position .position-selected").removeClass("position-selected");
    $(this).addClass("position-selected");
    $("#text_content").removeClass("name-bottom");
    if ($(".back-shirt-position .layout_curved").hasClass("position-selected")) {
      tshirts.text_curve_top($("#text_content h3"), false);
    } else {
      tshirts.text_curve_destory($("#text_content h3"), false);
    }
    tshirts.apply_canvas_to_tshirt();
  })
  $(".back-shirt-position .layout_straight_bottom").click(function() {
    $(".back-shirt-position .position-selected").removeClass("position-selected");
    $(this).addClass("position-selected");
    $("#text_content").addClass("name-bottom");
    tshirts.text_curve_destory($("#text_content h3"), false);
    tshirts.apply_canvas_to_tshirt();
  })
}

tshirts.back_set_design = function() {
  $("#text_content").css("font-family", t_font);
  $("#text_content").find("h3").css("font-family", t_font).end().find("h2").css("font-family", t_font);
  $("#text_content").css("color", t_color);
  tshirts.apply_canvas_to_tshirt();
}

tshirts.add_new_palyer = function() {
  $(".no-of-tshirt select").change(function() {
    var p_count = $(this).val();
    var preset_p_count = $("#tblSizes tbody tr").length;
    if (preset_p_count > p_count) {
      alert("Please remove user by clicking the delete button");
    } else {
      var i = p_count - preset_p_count;
      for (c = 0; c < i; c++) {
        tshirts.create_new_player()
      }
    }
  })
  $("#AddUsers").click(function() {
    tshirts.create_new_player();
  })
}

tshirts.create_new_player = function() {
  players_count = players_count + 1;
  c_number = $("#tblSizes tbody tr").length + 1;
  var obj = $("#tblSizes tbody tr:first").clone(true);
  obj.removeClass("selected").attr("id", "shirtrow_" + players_count).find("td:nth-child(1)").html(c_number)
  obj.find("td:nth-child(2) select").attr({
    name: "shirt_" + players_count + "_size",
    id: "shirtSize_" + players_count
  });
  obj.find("td:nth-child(3) input").attr({
    name: "shirt_" + players_count + "_back_text",
    id: "BackText_s_" + players_count
  }).val("YOUR NAME");
  obj.find("td:nth-child(4) input").attr({
    name: "shirt_" + players_count + "_number",
    id: "BackNo_s_" + players_count
  }).val("15");
  obj.find("td.remove").append("<a href='#'>Remove</a>");
  $("#tblSizes tbody").append(obj)
  tshirts.back_select_row();
}

tshirts.find_back_focus_event = function() {
  $("#tblSizes tbody tr.selected input").on('keyup', function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(tshirts.update_back_tshirt_text, doneTypingInterval);
  })
}

tshirts.update_back_tshirt_text = function() {
  var b_name = $("#tblSizes tbody tr.selected").find("td:nth-child(3) input").val();
  var b_number = $("#tblSizes tbody tr.selected").find("td:nth-child(4) input").val();
  $("#text_content").find("h3").text(b_name);
  $("#text_content").find("h2").text(b_number);
  tshirts.apply_canvas_to_tshirt();
}

tshirts.back_select_row = function() {

  $("#tblSizes tbody tr select, #tblSizes tbody tr input").off("focus").on("focus", function() {
    $("#tblSizes tbody tr.selected").removeClass("selected");
    $(this).parents("tr").addClass("selected");
    tshirts.find_back_focus_event();
    tshirts.update_back_tshirt_text();
  })
  $("#tblSizes tbody tr td.remove a").off("click").on("click", function(e) {
    // players_count = players_count - 1;
    $(this).parents("tr").nextAll().each(function(i, selector) {
      txt = $(selector).find('td:first').text();
      $(selector).find('td:first').text(txt - 1)
    })
    $(this).parents("tr").remove();
    e.preventDefault();
  })
}

tshirts.text_curve_top = function(selector, execute) {
  execute = typeof execute !== 'undefined' ? execute : true;
  selector.arctext({
    radius: 200,
    dir: 1
  });
  if (execute) {
    tshirts.apply_canvas_to_tshirt();
  }
}

tshirts.text_curve_bottom = function(selector, execute) {
  execute = typeof execute !== 'undefined' ? execute : true;
  selector.arctext({
    radius: 200,
    dir: -1
  });
  if (execute) {
    tshirts.apply_canvas_to_tshirt();
  }
}

tshirts.text_curve_destory = function(selector, execute) {
  execute = typeof execute !== 'undefined' ? execute : true;
  if (selector.data('arctext')) {
    selector.arctext('destroy');
  }
  if (execute) {
    tshirts.apply_canvas_to_tshirt();
  }
}

tshirts.change_image_color = function(myImg) {
  var canvas = document.createElement("canvas");
  canvas.width = myImg.naturalWidth
  canvas.height = myImg.naturalHeight
  var ctx = canvas.getContext("2d");
  ctx.drawImage(myImg, 0, 0);
  var imgd = ctx.getImageData(0, 0, myImg.naturalWidth, myImg.naturalHeight);
  rgb_color = hexToRgb(t_color);
  for (i = 0; i < imgd.data.length; i += 4) {
    imgd.data[i] = rgb_color.r;
    imgd.data[i + 1] = rgb_color.g;
    imgd.data[i + 2] = rgb_color.b;
  }
  ctx.putImageData(imgd, 0, 0);
  myImg.src = canvas.toDataURL("image/png");
}

$("documnet").ready(function() {

  t_color = $("#Dcolor").val();

  // if ($("#text_content").data("color")) {
  //   t_color = $("#text_content").data("color");
  // }

  if (!$("body .container").hasClass("back-preview")) {
    if ($("#add_names").prop('checked')) {
      t_font = $(".text-edit .display-fonts").val();
      $(".text-edit").removeClass("hidden");
      $("#text_content").append("<span></span>");
    } else if ($("#add_logo").prop('checked')) {
      $(".add-logo").removeClass("hidden");
      $("#text_content").append("<img src='' />");
    } else if ($("#add_decal").prop('checked')) {
      t_font = $(".text-decimal .display-fonts").val();
      $(".text-decimal").removeClass("hidden");
      $("#text_content").append("<img src='' />").append("<p class='top-text'></p>").append("<p class='bottom-text'></p>");
    }

    tshirts.item_select();
    if ($("#add_names").prop('checked')) {
      tshirts.enter_text();
    }
    tshirts.select_number();
    tshirts.change_enter_text();
    tshirts.logo_position_click_event();
    tshirts.change_image_and_text();
    
  } else {

    if (!$("#add_back_name").prop('checked')) {
      $(".back-preview .text-preview #text_content h3").addClass("hidden");
    } else if (!$("#add_number").prop('checked')) {
      $(".back-preview .text-preview #text_content h2").addClass("hidden");
    } else if (!$("#add_com_text").prop('checked')) {
      $(".back-preview .text-preview #text_content span").addClass("hidden");
    }
    players_count = $("#tblSizes tbody tr").length;
    t_font = $(".select-back-style .display-fonts").val();
    t_color = "#" + $("#tblSizes tbody tr.selected .text_color").val();


    tshirts.back_text_display_rule();
    tshirts.back_set_style();
    tshirts.back_name_position();
    tshirts.add_new_palyer();
    tshirts.back_set_design();
    tshirts.back_select_row();
  }




  $("#generate-image").click(function() {
    html2canvas($("#shirt-preview-area")).then(function(canvas) {
      //var context = canvas.getContext("2d");
      var img = $(".shirt-preview > img")[0];
      var can3 = $("#update_logo")[0];
      can3.width = 250;
      can3.height = 280;
      var ctx3 = can3.getContext('2d');
      ctx3.drawImage(img, 25, 0);
      ctx3.drawImage(canvas, 0, 0);
    });
  })

})
