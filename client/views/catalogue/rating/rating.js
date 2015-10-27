Template.apiBackendRating.rendered = function () {
  // Get reference to template instance
  var instance = this;

  // Get API Backend ID from template instance
  var apiBackendId = instance.data._id;

  // Add the jQuery RateIt widget
  $("#rating-" + apiBackendId).rateit({max: 4});
};

Template.apiBackendRating.events({
  "click .rateit": function (event, instance) {
    // Get API Backend ID from template data context
    var apiBackendId = instance.data._id;

    // Get rating from template based on API Backend ID
    var rating = $("#rating-" + apiBackendId).rateit('value');
  }
});
