/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Template } from 'meteor/templating';

// Meteor contributed packages imports
import { Modal } from 'meteor/peppelg:bootstrap-3-modal';

Template.proxyItem.events({
  'click #edit-proxy': function () {
    // Get proxy document
    const proxy = this.proxy;

    // Show proxy form modal
    Modal.show('proxyForm', { proxy });
  },
  'click #remove-proxy': function () {
    // Get proxy document
    const proxy = this.proxy;

    // Show remove proxy modal
    Modal.show('removeProxy', { proxy });
  },
});

Template.proxyItem.helpers({
  equals (a, b) {
    return a === b;
  },
});
