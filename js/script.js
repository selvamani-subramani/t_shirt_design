var tshirts = {};
var t_color = "";
var t_font = "sans-serif";
var preview_width = 440;
var preview_height = 280;
var tshirt_logo_position = "tshirt-image-center";
var typingTimer; //timer identifier
var doneTypingInterval = 1200; //time in ms, 1.2 second for example
var players_count = 0;
var stack = [20];
var stack_index = 0;

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
// history management

tshirts.history_forward = function() {
  if (stack.length > stack_index) {
    stack_index++;
    tshirts.gat_data_from_db(stack[stack_index]);
  }
}

tshirts.history_back = function() {
  if (stack_index > 0) {
    stack_index--;
    tshirts.gat_data_from_db(stack[stack_index]);
  }
}

tshirts.add_history = function(id) {
  stack_index++;
  stack.push(id)
}


//spinner 

tshirts.spinner_on = function() {
  $(".text-decimal .load-images.box-design > span").show()
}

tshirts.spinner_off = function() {
  $(".text-decimal .load-images.box-design > span").hide()
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
  $(".text-decimal .load-images").not(".clipart").off("click").on("click", "img", function() {
    if (!$(this).hasClass("clipart")) {
      image_data = $(this).attr("src");
      $(".text-decimal .image-box img").attr("src", image_data);
      $(".text-decimal .load-images").toggleClass("hidden");
      tshirts.update_image_and_text();
      tshirts.change_image_color($("#text_content img")[0]);
    }
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

tshirts.gat_data_from_db = function(term_id) {
  tshirts.spinner_on();
  $.ajax({
    url: 'http://192.169.197.129/dev/apparelstore/wp-admin/admin-ajax.php',
    type: 'post',
    dataType: 'json',
    data: {
      action: 'clipart_images',
      term_id: term_id,
    },
    success: function(data) {
      tshirts.update_image_to_box(data);
    },
    error: function(e) {
      console.log(e);
      tshirts.spinner_off();
    }
  });
}

tshirts.update_image_to_box = function(data) {
  $(".load-images img").remove();
  data.forEach(function(datum) {
    for (var i in datum) {
      if (datum[i].apply) {
        $("<img/>").attr("id", i).attr("src", datum[i].src).appendTo('.load-images');
      } else {
        $("<img/>").addClass('clipart').attr("id", i).attr("src", datum[i].src).appendTo('.load-images');
      }
    }
  });
  tshirts.spinner_off();
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



  $(".load-images").on('click', ".clipart", function() {

    var data = [{
      47: {
        src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABHCAYAAACQwsCOAAALH0lEQVR4nOWcfYyVxRXGn3lDiCGEULRoqaHEIKHUEkuMJcQQo9TaaK21Rq0lSg1FmxhC1KA1RmMMNdRYa40hxBhqrF+1xqjxs/Ur1FBKCbVI/WPdLAgGwWJFpXRd9/n1j5kr7777vrv33r1776JPMrnszJmvw5mZM+eceaUxBiADsk6Po16MxYFOk/QIcESnB3LYARgHrAWwvbpYblvARGA2sBBYBJwITOzEeMcMAAGLbG+wje03be+0PQ6YBJxn+27bW2wfSDT5tB+4Auj0VNoL21OAK4GtDMTdQC/wNHCQwXgPeD39bgLmf6GYBxwL3Gn7PyXSBHCF7d6SsgO2X7P9rO3Ftp/4Qi1f2+OBWyqkKo+FwIGqQts3AK8BO4E1wNmfe0baHm/7iTKJK6TdtqcORQPMtr2vkL/P9v3AGcC4Ts+35QCuH0bqargeWDwMzXLgKqC/orwntXPMaM+rnXrgz+ohAr4maaKk30l6v4LsNkmfSLoUeLekfIakVZK6iHvtsQ2PdqxhCGkZCTYBlyRp3DpEHweAVbYntXpeodUNVgHoUZSM0cAu4GFJXZKOl3ReCOG4ErrtwOVZlr3Qqo7bxkDbd0ha0Yautkt6UlJ3COFoSWdKmsuhg+VTSb8KIdwUQvh0pJ21UwKnSXpd0lEtbHaXIkNmVJS/K+k5YLOkSSGEH0mal8oeBH6aZdknLRzP6AGYbvvVOtSYelMvcIrt/jrp99i+zfYy4NFU717bnWbN0EjXtdXARy0+QHptz7Td3UTdbcBTtg8CF3WaR6UgWk2uK1F4W5letD0P6B5BG122x3eaX4MAPD6MFOwGHm1CeorYDCyw/VSd9H3AHqIhoqb2nNbsPEdTkX6EaKb6LEn6GPizolL9LeC/RZom0jzg2RDCE5IuBz4YgvZJSV+W9BVJR0s6UtL3GUuWHGA6cKPtnnRvBVhteyG5Cz9wQ628Vb/A88BC248NQbeeqBGMHQDjgXOAp9ISKaILeBW4B7gAmAD8qYQOYLPtlQxvsanCR8DK1M+OCppu2zM6zbeaanKL7R0Nbtw9jlbnsrIVRMfSqa6wF9aZNts+A7jD5bbFbnfijuxoljqHaC0uk7ZW4HlgSlr2zUoixENiDXAa8d5cxEbb7XNe2T6/CWlrKgGbbE8ErmpBWztsn2f7OuBgofwu2nWIEE+80bCqVOFu4v76egva6gfWAacW2utnBGpMw7C9uh0SmFKf7em2l7Swza60Naz1oWvgVtrlzLedEZXXduEaYAqtlfyDwNKUelPexc3wo2GuZ1lmYCrDK7ifAq6Dbrj07RDC+8D2Bup8AvyeakX9CGCtpK9L+mGiu5ompLApsQ0h7AohKJec+30yhPA9SUeGEM4KIXxcoG001fwaexuo8xtJR4QQJgxBkwFXSfpOCOHHIYS5kk5qCwMlvZSXNEkXSnpQ0unAD0IIz2VZ9mEI4TnF69VIJLBm9MzqrSNpk6RhV4kkASskTQZ+nebRFgauUzRkKoTwsKQ/SvpJCOGVLDvUJNEic1YIzdttQwhvpclOr7cOMCeE8EoD9HdIehRY2PgImwRwX9p8zykpm0yMVelh5DifeL9uBD22ZwD7G6jzIrABmNoIH5oWDdtTQwgbiEt2JnCcpK+GEE4E5ocQJjTbdg67JB0PLA0h3NVIReDa5PO4vc4qBj6UdGEjTqemdZ8sy/ZKOl3SXkkvhRCytBEfF0L4n6R/S3pb0j8lNWM3t6SrgU9DCD9vtHII4SZJL0l6pc4qWQhhsqRZjfbVUhANAeOJsX4ZcEaT169bANle3mDdj3woBG6r7Vm23ymh63d5qNyguMRRh+0pOQaOA461PQtYQQwAqhu2e4CLiCflmTRmTNgPLGOgkeN+4vWtt0DbT7Rkry/k39vI3FsShBNCWATMIjq3zwVuVVQ7yrYIhxD2SnpD0e34seJy3SPpb7nTcyVws6RGrCWrJV2qgfNaHELYJOkXQH4/zBRdnd+V9BhwZspvxd7dGIg3k+GuWnuAW22fUGMs0bA60/Z04ASiUfYOGpTahP3EMLcy9AKnMNhPsyaNY2K6DwM80HYGSpLtTRV7Uq/t24ABcSnAyT5kVK3XtzvUnrnW0c9bRdOd/rN25/J2khRq23NtH7R9T0cYSPT9FvEeBeXUMVB8CSMzlJZhEcPofbbvBi4uZM/JjW010P5DRJJKBrYHmFugke1baL1NcQvx8BgOfcBcBlqTrsyNbwqwpO3MS51fVhjoqYXyzPatLWJYEcsYHKheCttrbF+R+/uxwjg742QHFgDdxJCLVYUyAdeNAuMA9ti+oCR/P1GFKaKb+Lakhh2MlZBgog44mYKPwfZFrTgoKg6PG2xvLMlf7nLP3z6i/veZQg007Z1rKefT3fODfB5xH7xHoxMF8a/U78mF/LclfRBCmF1SZ4qk23MWokzSXMV7d8MYVdG1PQF4SDHmuaVIVuq/SrqppPguSUPdn+cX2pot6ZkWDq81AFY1sJe16mQ+YPu0RirYXtPsHEdNAoGZRJN5KUIIbyhGj26Q9FYI4QNJpwJ3Spo8gq6fUeMBQ3Uba9sGSk5A230pfx65ezLRcr2W1kQ6nEtU4BvBlk7yahCA40qY8bLtuSW0c4gRo63ANscQ3nrwTu7fXZ3gUyUYeK3rI74aGrRdEGOc9w01S8cw3Mp3cwUsI0aCDYdeYgRXrY+dneBTKWyPc4oNTJM/r4JuUTJ+Vul4/Y5v3451jCYYTifcYvu6OvXHZ4H5ub93tJtPlbA9N/2v9lERwO0Y1zwU87rSSSpggu39wzDkI2IQUtHCXNXHYuCYnHL/Zrv5VAnbS9PKuLGsnGg7rAp8hHjITMrRz6pjSXYx2OLcRbRoF7HP9iTiwVXbGtY3O9+WqzEhhG9I+jvwy2JZkqh1KlcbPgkhXCvptyEE5+qcWEe3M0vG8QdJ/2CwOvNglmUfEo25Naf99jr6aA+SBJ1SUbakQoIOAGdX1LmzDgksop/4YYrJxXzbsyXJMfawJoGV+mrbQTwJB+XbnuKB1uBa2k/B9JVra5KbC+h8NdWfVsh/PNd2fg+cX9Z/R0DF914ov9YdpCK4EZhGjBQYCr1EBbz43uSC1MZJubw+2/Ny7S9I+Ts8Fh/a5GF7UslJ2g9cUqQluTNd7sutmaoOJMbNAsY5Box/doKTjKLA4lz+Q/mV4UP+5pvbyIrmQPy0SW3ytd9VLjz0c/TOPUAyLBTo+xwdVytsH5Vr+5SaiCW6pbmyNSn/ADCj0NeLjkr8SO7dow9HJ1LR4Pmi7ZprU45hvLdz6EFivwsGWOK7j0HtA+tydNtsj0v9ZkBXqruyUKd21VzSDh6MCEmq+nKT3AdMT2XjiFED19i+jBgGMgeYWliW68raJr5Tqb0B6QfOyPV7Uu1AqTE11ZHt+4DbiytgTML2ANXF9qB9r6RO/gsfW2wPMsgmyV6Xa/fevIQCdxENBgOedRHdnzdyuHwhzvY9uWX4dNkyLNDPc3RwQ4wvLPVXOEba9yW6bQx8hzfZ9psMdqtmwAktmVi7QPzCUO3kHHRjKNAexSFrSncVfaLrSXR7gFmF8gXFQ+OwheNTe4gBR5UAjnLyrgEvU/HRnKQSrU90e6jvqnd4Ip2E/UQLcaW6QNTntiYpXUmFc9v21JxEbyRGxX5+QbyKASwvK7d9BPGjOT3AbcUNP9dOBpxrezcxcms5Y8QZPqqfPQGmSNoo6Zsp7LeWn0k6QdG9+Lakv4QQPq5oYzbxavalEMLLkl7It/W5BjHu7vxOj+OwRdLVOj2MUcX/AR6wNzR8CcyWAAAAAElFTkSuQmCCCg==",
        apply: true
      }
    }, {
      48: {
        src: "data:image/png;base64,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",
        apply: true
      }
    }, {
      49: {
        src: "data:image/png;base64,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",
        apply: false
      }
    }];

    var term_id = $(this).attr('id');
    $('#clipartclicked').val(term_id);
    tshirts.add_history(term_id);

    tshirts.gat_data_from_db(term_id);
    // tshirts.update_image_to_box(data);

  });

  $(".text-decimal .load-images i.back").on('click', function() {
    tshirts.history_back();
  });

  $(".text-decimal .load-images i.front").on('click', function() {
    tshirts.history_forward();
  });

})
