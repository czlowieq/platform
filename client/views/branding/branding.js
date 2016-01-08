Template.branding.created = function () {

  var instance = this;

  // Subscription to branding collection
  instance.subscribe('branding');

  // Subscribe to project logo collection
  instance.subscribe('projectLogo');
};

Template.branding.helpers({
  branding: function () {
    // Get Branding collection content
    return Branding.findOne();
  }
});


Template.branding.helpers({
  projectLogo: function () {
    // Get last uploaded image from collection
    var lastUploadedLogo = ProjectLogo.findOne({}, {sort: {uploadedAt: -1}});
    // Check if new logo was uploaded, if so change it with previous
    if (lastUploadedLogo) {
      return lastUploadedLogo
    }
  }
});


Template.AdminLTE.helpers({
  skin: function () {
    // Get color theme from branding collection
    var adminLTESkin = Branding.findOne().color_theme;
    // Set chosen AdminLTE skin or use default
    return adminLTESkin || 'blue-light';
  }
});
