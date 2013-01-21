/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/21
 * Time: 3:29
 * To change this template use File | Settings | File Templates.
 */

var OutputBox = (function () {
  function OutputBox(selector) {
    this.jqueryObject = $(selector);
  }

  OutputBox.prototype.message = function (subject, body) {
    $(this.jqueryObject).prepend($('<p>').addClass('message').append(
      $('<span>').addClass('message-subject').html(subject)
    ).append(
      $('<span>').addClass('message-body').html(body)
    ));
  };

  OutputBox.prototype.log = function (msg) {
    $(this.jqueryObject).prepend($('<p>').addClass('system-log').html(Array.apply(null, arguments).join('')));
  };

  return OutputBox;
})();

