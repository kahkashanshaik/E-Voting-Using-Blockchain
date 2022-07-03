App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    hasVoted: false,

    init: function() {
        return App.initWeb3();
    },

    initWeb3: function() {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContract();
    },

    initContract: function() {
        $.getJSON('/build/contracts/Election', function(election) {
            App.contracts.Election = TruffleContract(election);
            App.contracts.Election.setProvider(App.web3Provider);
        }).done(function() {
            return App.render();
        });
    },

    // Listen for events emitted from the contract
    listenForEvents: function() {
        App.contracts.Election.deployed().then(function(instance) {
            instance.votedEvent({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function(error, event) {
                console.log("event triggered", event)
                // Reload when a new vote is recorded
                App.render();
            });
        });
    },

    render: function() {
        var electionInstance;
        var loader = $("#loader");
        var content = $("#content");

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                App.account = account;
                $("#accountAddress").html("Your Account: " + account);
            }
        });


            App.contracts.Election.deployed().then(function(instance) {
                return instance.electionStatus();
             }).then(function(electionStatus) { 
                if(electionStatus == 0){
                      $('#startElection,#election-yetto-start').each(function(){
                        $(this).show('slow');
                      });
                        $('#content').hide();
                }
                if(electionStatus == 1){
                        $('#stopElection').show();
                }
                if(electionStatus == 2){
                        $('#viewElectionResults').show();
                        $('#content').show();
                }
             }).catch(function(error){
              console.log(error);
             });

        // Load contract data
        var totalcandidates = 0;

        App.contracts.Election.deployed().then(function(instance){
           return instance.electionStatus();
        }).then(function(electionStatus){
            if(electionStatus == 0){
                
            }else{
                $('#candidatesProfiles').show('slow');
                    content.show('slow');

            }
        }).catch(function(error){
            console.log(error);
        });
        var totalcandidates=0;
        App.contracts.Election.deployed().then(function(instance) {
                electionInstance = instance;
            return electionInstance.candidatesCount();
        }).then(function(candidatesCount) {
            var candidatesResults = $("#candidatesResults");
            candidatesResults.empty();

            var candidatesSelect = $('#candidatesSelect');
            candidatesSelect.html('<option value=""> -- Select Candidate -- </option>'); 
            for (var i = 1; i <= candidatesCount; i++) {
                totalcandidates += 1;
                electionInstance.candidates(i).then(function(candidate) {
                    var id = candidate[0];
                    var name = candidate[1];
                    var voteCount = candidate[2];

                    // Render candidate Result
                    var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
                    candidatesResults.append(candidateTemplate);

                    // Render candidate profile template
                    var candidateprofiletemp = "<div class='col-sm-3'><div class='card elevation-5'><div class='card-body'><p class='text-center'><strong>"+ name +"</strong></p><br> <img src='/img/avatar5.png' class='img-circle person img-fluid ' alt='Random Name' width='150' height='150'></div></div></div>";
                    $('#candidatesProfiles').append(candidateprofiletemp);
                    // Render candidate ballot option
                    var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
                    candidatesSelect.append(candidateOption);
                });
            }
            $('#totalCanidates').html(totalcandidates);
            return electionInstance.voters(App.account);
        }).then(function(hasVoted) {
            // Do not allow a user to vote
            if (hasVoted) {
                $('#election-yetto-start').hide();
                $('#voteform').hide();
                $('#vote-success').show('slow');
            }
            loader.hide();
        }).catch(function(error) {
            console.warn(error);
        });
    },

    castVote: function() {
        var candidateId = $('#candidatesSelect').val();
        App.contracts.Election.deployed().then(function(instance) {
            return instance.vote(candidateId, {
                from: App.account
            });
        }).then(function(result) {
            // Wait for votes to update
            window.location.reload();
            $("#content").hide();

        }).catch(function(err) {
            console.error(err);
        });
    },

    addCandit: function() {
        var candidateAdded = '';
        var candidateName = $('#candidate_name').val();
        if (candidateName != '') {
            App.contracts.Election.deployed().then(function(instance) {
                var candidateAdded = instance.addCandidate(candidateName, {
                    from: App.account
                });
            }).then(function(result) {
                if (candidateAdded)
                    console.log("candidate Added");
                else
                    console.log(candidateAdded);
                $('#candidate_name').val('');
            }).catch(function(err) {
                console.log(err);
            });
        } else {
            toastr.error("Fill Candidate Name", 'Failure!');
        }
    },

    startElection: function(){
     App.contracts.Election.deployed().then(function(instance){
      var updateDetails = instance.updateElectionStatus(1,  { from : App.account} );
    }).then(function(result){
      if(result)
        {
            $('#stopElection').show('slow');
            $('#startElection').hide('slow');
            $('#viewElectionResults').hide('slow');
        }
    }).catch(function(err){
      console.log(err);
    });
  },

  endElection: function(){
     App.contracts.Election.deployed().then(function(instance){
      var updateDetails = instance.updateElectionStatus(2,  { from : App.account} );
    }).then(function(result){
      if(result){
            $('#stopElection').hide('slow');
            $('#startElection').hide('slow');
            $('#viewElectionResults').show('slow');
      }
    }).catch(function(err){
      console.log(err);
    });
  },
  check:function(){
    }
};



$(function() {
    $(window).load(function() {
        App.init();
    });
    $.ajaxSetup({
        async: false
    });
});