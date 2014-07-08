$(function() {
  var poll_interval = 2

  var relatizer = function(){
    var dt = $(this).text(), relatized = $.relatizeDate(this)
    if ($(this).parents("a").length > 0 || $(this).is("a")) {
      $(this).relatizeDate()
      if (!$(this).attr('title')) {
        $(this).attr('title', dt)
      }
    } else {
      $(this)
        .text('')
        .append( $('<a href="#" class="toggle_format" title="' + dt + '" />')
        .append('<span class="date_time">' + dt +
                '</span><span class="relatized_time">' +
                relatized + '</span>') )
    }
  };

  $('.time').each(relatizer);

  $('.time a.toggle_format .date_time').hide()

  var format_toggler = function(){
    $('.time a.toggle_format span').toggle()
    $(this).attr('title', $('span:hidden',this).text())
    return false
  };

  $('.time a.toggle_format').click(format_toggler);

  $('.backtrace').click(function() {
    $(this).next().toggle()
    return false
  })

  ///////////////// Latency Support /////////////////////
  $.fn.numericDataValue = function() {
    if (typeof this.attr('data-value') === 'undefined') {
      return null;
    } else {
      return parseFloat(this.attr('data-value'))
    }
  }
 
  var render_arrows = function(node) {
    node.find('.size.with_arrow, .latency.with_arrow').each(function() {
      previous_value = $('#' + $(this).attr('id')).numericDataValue();
      current_value = $(this).numericDataValue();
      var arrow = $('<span>').addClass('arrow');
      if ((previous_value === null) ||
          ((current_value < 1) && (previous_value < 1)) ||
          (previous_value == current_value)) {
        arrow.addClass('none');
      } else {
        arrow.addClass((previous_value < current_value) ? 'up' : 'down');
      }
      $(this).append(arrow);
    });    
  }
  ///////////////////////////////////////////////////////

  $('a[rel=poll]').click(function() {
    var href = $(this).attr('href')
    $(this).parent().text('Starting...')
    $("#main").addClass('polling')

    setInterval(function() {
      $.ajax({dataType: 'text', type: 'get', url: href,
        success: function(data) {
          node = $(data)
          render_arrows(node);
          $('#main').html(node)
          $('#main .time').relatizeDate()
        },
        error: function(data) {
          if (data.status == '401') { window.location.href = '/' }
        }
      })
    }, poll_interval * 1000)

    return false
  })

  $('ul.failed li').hover(function() {
    $(this).addClass('hover');
  }, function() {
    $(this).removeClass('hover');
  })

  $('ul.failed a[rel=retry]').click(function() {
    var href = $(this).attr('href');
    $(this).text('Retrying...');
    var parent = $(this).parent();
    $.ajax({dataType: 'text', type: 'get', url: href, success: function(data) {
      parent.html('Retried <b><span class="time">' + data + '</span></b>');
      relatizer.apply($('.time', parent));
      $('.date_time', parent).hide();
      $('a.toggle_format span', parent).click(format_toggler);
    }});
    return false;
  })


})