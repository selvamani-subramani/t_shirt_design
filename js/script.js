var tshirts = {};
tshirts.item_select = function(){
  $(".select-design").find("input").not("#add_nos_front").change(function(){
    if(!$(this).prop('checked')){
      $("#text-preview-area").addClass("low-opacity");
    } else {
      $("#text-preview-area").removeClass("low-opacity");
      $("#add_names, #add_logo, #add_decal").not($(this)).prop('checked', false);
    }
    
  })

  $("#add_names").click(function(){
    $(".text-edit, .add-logo, .text-decimal").addClass("hidden");
    $(".text-edit").removeClass("hidden");
  })

  $("#add_logo").click(function(){
    $(".text-edit, .add-logo, .text-decimal").addClass("hidden");
    $(".add-logo").removeClass("hidden");
  })

  $("#add_decal").click(function(){
    $(".text-edit, .add-logo, .text-decimal").addClass("hidden");
    $(".text-decimal").removeClass("hidden");
  })
}

tshirts.enter_text = function(){
  $("#update_logo")
}

$("documnet").ready(function(){

  tshirts.item_select();
  tshirts.enter_text();
  $("#add_nos_front").click(function(){
    if($(this).prop('checked')){
      $(".shirt-position").addClass("add-number");
    } else{
      $(".shirt-position").removeClass("add-number")
    }
  })
})

