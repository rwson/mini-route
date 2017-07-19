window.onload = function() {
	var doc = document;

	var router = MiniRoute(document.querySelector("#view"));
	router.config({
		pushState: false,
		routes: [
			{
				name: "test111",
				url: "/test111",
				templateUrl: "/views/111.html",
				handler: function() {
					console.log("I'm test111's handler");
				}
			},
			{
				name: "test222",
				url: "/test222",
				templateUrl: "/views/222.html",
				handler: function() {
					console.log("I'm test222's handler");
					doc.querySelector(".jump").addEventListener("click", function(e) {
						router.go("test222333", {
							name: "fuck",
							id: "test"
						});
					});
				}
			},
			{
				name: "test222333",
				url: "/test222/:id/:name",
				templateUrl: "/views/222333.html",
				handler: function(params) {
					console.log(params);
					console.log("I'm test2223333's handler");
				}
			}
		]
	});

	router.on("route:change:start", function() {
		console.log("%c router change start callback", "color: yellow");
	});

	router.on("route:change:success", function() {
		console.log("%c router change success callback", "color: green");
	});

	router.on("route:change:completed", function() {
		console.log("%c router change completed callback", "color: blue");
	});

	router.on("route:change:failed", function(e) {
		console.log("%c router change failed callback", "color: red");
		console.log(e);
	});

	router.start();
}