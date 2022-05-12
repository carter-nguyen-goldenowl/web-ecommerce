$.ajaxSetup({
    headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
    },
});

function incrementValue(quantity) {
    var value = parseInt(document.getElementById("quantity").value, 10);
    value = isNaN(value) ? 0 : value;
    if (value >= quantity) {
        toastr.warning(
            "Please enter less than product " + quantity + " in stock "
        );
    } else {
        value++;
    }
    document.getElementById("quantity").value = value;
}
function decreaseValue() {
    var value = parseInt(document.getElementById("quantity").value, 10);
    value = isNaN(value) ? 0 : value;
    if (value <= 1) {
        return;
    } else {
        value--;
    }
    document.getElementById("quantity").value = value;
}

function incrementQuantityCart(id, quantity) {
    var value = parseInt(document.getElementById(`quantity_${id}`).value, 10);
    value = isNaN(value) ? 0 : value;
    if (value >= quantity) {
        toastr.warning(
            "Please enter less than product " + quantity + " in stock "
        );
    } else {
        value++;
        $.ajax({
            method: "POST",
            dataType: "JSON",
            url: `/carts/${id}`,
            data: {
                quantity: value,
            },
        });
    }
    document.getElementById(`quantity_${id}`).value = value;
}

function decreaseQuantityCart(id) {
    var value = parseInt(document.getElementById(`quantity_${id}`).value, 10);
    value = isNaN(value) ? 0 : value;
    if (value <= 1) {
        return;
    } else {
        value--;
        $.ajax({
            method: "POST",
            dataType: "JSON",
            url: `/carts/${id}`,
            data: {
                quantity: value,
            },
        });
    }
    document.getElementById(`quantity_${id}`).value = value;
}

function addtowishlist(id) {
    $.ajax({
        method: "POST",
        dataType: "JSON",
        url: "/wishlist",
        data: {
            product_id: id,
        },
    });
    window.location.href = "/wishlist";
}

$(document).ready(function () {
    $("#search_name").keyup(function () {
        var search_name = $(this).val();
        if (search_name != "") {
            $.ajax({
                url: "/home",
                method: "POST",
                data: { search_name: search_name },
                success: function (res) {
                    $("#nameProductList").fadeIn();
                    $("#nameProductList").html(res);
                },
            });
        }
    });
    $(document).on("click", "li", function () {
        $("#search_name").val($(this).text());
        $("#nameProductList").fadeOut();
    });

    $("#coupon").keyup(function () {
        var couponElement = document.getElementById("coupon");
        var coupon = $(this).val();
        if (coupon != "") {
            $.ajax({
                url: "/applycoupon",
                method: "POST",
                data: { coupon: coupon },
                success: function (res) {
                    if (res) {
                        if (res.quantity == 0) {
                            couponElement.classList.add("text-red-600");
                            toastr.warning("coupon unavailable");
                        } else if (res.quantity != 0) {
                            couponElement.classList.add("text-green-600");
                            toastr.success("coupon is available");
                        }
                    } else {
                        couponElement.classList.add("text-red-600");
                    }
                },
            });
        }
    });
});

var pusher = new Pusher("7f59a70c770ed9504939", {
    cluster: "ap1",
});

var channel = pusher.subscribe("notification");
channel.bind("App\\Events\\NotificationPusherEvent", function (data) {
    console.log(data.message);
    $.ajax({
        method: "POST",
        dataType: "JSON",
        data: { user_id: data.user_id },
        url: "/checkorder",
        success: function (res) {
            if (res === 1) {
                var countNotification =
                    document.getElementById("countNotification");

                let count = parseInt(
                    countNotification.getAttribute("data-count")
                );
                count++;
                countNotification.setAttribute("data-count", count);

                countNotification.className +=
                    "absolute -right-1 -top-1 w-5 h-5 rounded-full flex items-center justify-center bg-primary text-white text-xs";

                countNotification.textContent = count;
                var Notifications = document.getElementById("Notifications");

                var li = document.createElement("li");
                var a = document.createElement("a");
                if (data.message == 200) {
                    var message = "đang vận chuyển";
                } else {
                    var message = "đã giao";
                }
                a.className +=
                    "dropdown-item text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100";
                a.appendChild(
                    document.createTextNode(`Đơn hàng của bạn ${message}`)
                );
                li.appendChild(a);
                Notifications.appendChild(li);
            }
        },
    });
});
