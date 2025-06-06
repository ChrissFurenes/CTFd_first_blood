// Bruk markdown-it via CTFd.lib.markdown()
CTFd._internal.challenge.renderer = CTFd.lib.markdown();

// Disse funksjonene må være definert umiddelbart
CTFd._internal.challenge.preRender = function () {};

CTFd._internal.challenge.render = function (markdown) {
  return CTFd._internal.challenge.renderer.render(markdown);
};

CTFd._internal.challenge.postRender = function () {
  function ordinalize(i) {
    var j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) return i + "st";
    if (j == 2 && k != 12) return i + "nd";
    if (j == 3 && k != 13) return i + "rd";
    return i + "th";
  }

  function getSolves(id) {
    return CTFd.api.get_challenge_solves({ challengeId: id }).then((response) => {
      const first_blood_bonus = [0,0,0] // CTFd._internal.challenge.data.first_blood_bonus;
      const data = response.data;

      $(".challenge-solves").text(data.length + " Solves");

      const box = $("#challenge-solves-names");
      box.empty();
      for (let i = 0; i < data.length; i++) {
        const name = data[i].name;
        const date =
          typeof dayjs !== "undefined"
            ? dayjs(data[i].date).fromNow()
            : Moment(data[i].date).local().fromNow();
        const account_url = data[i].account_url;

        const tr = $("<tr>");
        const td1 = $('<td style="width: 10%;">');

        if (i < first_blood_bonus.length) {
          let text = "<b>" + ordinalize(i + 1) + "</b>";
          if (i <= 0) {
            text = '<span class="award-icon award-medal-' + ordinalize(i + 1) + '"></span>' + text;
          } else {
            text = '<span class="award-icon award-medal"></span>' + text;
          }
          td1.html(text);
        }

        tr.append(td1);
        const td2 = $("<td>").append($("<a>").attr("href", account_url).text(name));
        const td3 = $("<td>").text(date);
        tr.append(td2).append(td3);
        box.append(tr);
      }
    });
  }

  $(".challenge-solves")
    .off("click")
    .on("click", function (event) {
      event.preventDefault();
      $(this).tab("show");
      $("#solves thead").html("<tr><td></td><td><b>Name</b></td><td><b>Date</b></td></tr>");
      getSolves($("#challenge-id").val());
    });
}

CTFd._internal.challenge.submit = function (preview) {
    var challenge_id = parseInt(CTFd.lib.$('#challenge-id').val())
    var submission = CTFd.lib.$('#challenge-input').val()

    var body = {
        'challenge_id': challenge_id,
        'submission': submission,
    }
    var params = {}
    if (preview) {
        params['preview'] = true
    }

    return CTFd.api.post_challenge_attempt(params, body).then(function (response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response
        }
        return response
    })
};
