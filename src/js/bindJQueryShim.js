
// angular-nanoscroller needs this so that Angular uses jQuery instead of
// jqLite. webpack correctly requires the modules from the variables,
// except when window.variable is used.

window.jQuery = $;
