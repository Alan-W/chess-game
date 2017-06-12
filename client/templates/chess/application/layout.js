Template.layout.helpers({
	activeRouteClass() {
		var args = Array.prototype.slice.call(arguments, 0);
		args.pop();

		// change the current active navigation item by the current route path
		var active = _.any(args, function (name) {
			return Router.current() && Router.current().route.getName().indexOf(name) != -1;
		});

		return active && 'nav-active';
	},
});