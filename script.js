(function() {
  var canv = document.getElementById("Game");
  canv.width = 800;
  canv.height = 500;
  var cont = canv.getContext("2d");
  var scale = 1;
  var keysheld = { "up": {}, "down": {}, "left": {}, "right": {}, "special": {}, "power 1": {}, "power 2": {}, "power 3": {} };
  var keybinds = [["a", "left"], ["s", "down"], ["w", "up"], ["d", "right"], ["ArrowUp", "up"], ["ArrowLeft", "left"], ["ArrowDown", "down"], ["ArrowRight", "right"], [" ", "up"], ["1", "power 1"], ["2", "power 2"], ["3", "power 3"], ["1", "special"], ["2", "special"], ["3", "special"]];
  window.addEventListener("keydown", function(e) {
    for (var i = 0; i < keybinds.length; i++) {
      if (e.key == keybinds[i][0]) {
        keysheld[keybinds[i][1]][keybinds[i][0]] = 1;
      }
    }
    if (e.key == " " || e.key.startsWith("Arrow")) { e.preventDefault(); };
  });
  window.addEventListener("keyup", function(e) {
    for (var i = 0; i < keybinds.length; i++) {
      if (e.key == keybinds[i][0]) {
        keysheld[keybinds[i][1]][keybinds[i][0]] = 0;
      }
    }
  });

  var getkeys = function() {
    var newkeys = { "up": 0, "down": 0, "left": 0, "right": 0, "special": 0, "power 1": 0, "power 2": 0, "power 3": 0 };
    var keys = Object.keys(keysheld);
    for (var i = 0; i < keys.length; i++) {
      var keys2 = Object.keys(keysheld[keys[i]]);
      for (var i2 = 0; i2 < keys2.length; i2++) {
        if (keysheld[keys[i]][keys2[i2]] == 1) {
          newkeys[keys[i]] = 1;
          break;
        }
      }
    }
    return newkeys;
  }
  var lastkeys = getkeys();
  var nowkeys = getkeys();
  document.getElementById("Play").addEventListener("click", function() {
    animation_one = 101;
    this.style.display = "none";
  });
  document.getElementById("skip").addEventListener("click", function() {
    player.x = end[0];
    player.y = end[1];
  });
  document.getElementById("Back").addEventListener("click", function() {
    if (screen == "prison") {
      this.style.display = "none";
      animation_one = -1;
      screen = "main menu";
      for (var i = 0; i < prisons.length; i++) {
        prisons[i].style.display = "none";
      }
      dialogue = false;
    }
    else if (screen == "ingame") {
      ingamestarted = false;
    }
  });
  var spawndata;
  var prisons = [document.getElementById("Prison 1"), document.getElementById("Prison 2"), document.getElementById("Prison 3"), document.getElementById("Prison 4")];
  var powers = [document.getElementById("power 1"), document.getElementById("power 2"), document.getElementById("power 3")];
  for (var i = 0; i < prisons.length; i++) {
    prisons[i].addEventListener("click", function() {
      if (this.state == "ready" || this.state == "done") {
        ingamestarted = true;
        for (var i2 = 0; i2 < prisons.length; i2++) {
          prisons[i2].style.display = "none";
        }
        currentmap = eval(this.mapdata);
        level = this.level;
        spawndata = getspawns(currentmap);
        player.x = spawndata.player.x;
        player.y = spawndata.player.y;
        player.xvel = 0;
        player.yvel = 0;
        enemies = spawndata.enemies;
        gamestart = 0;
        projectiles = [];
        cooldowns = [0, 0, 0];
        eprojectiles = [];
        hp = 15;
      }
    });
  }
  var getmapdata = function(img) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    cont.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0);
    var map = Array(img.height).fill(0).map(x => Array(img.width).fill(0));
    var celldata;
    for (var y = 0; y < img.height; y++) {
      for (var x = 0; x < img.width; x++) {
        celldata = context.getImageData(x, y, 1, 1).data;
        if (celldata[3] == 0) {
          map[y][x] = 0;

        }
        else if (celldata[0] == 255 && celldata[1] == 255 && celldata[2] == 255 && celldata[3] == 255) {
          map[y][x] = 1;
        }
        else if (celldata[0] == 255 && celldata[1] == 0 && celldata[2] == 0 && celldata[3] == 255) {
          map[y][x] = 2;
        }
        else if (celldata[0] == 0 && celldata[1] == 0 && celldata[2] == 0 && celldata[3] == 255) {
          map[y][x] = 3;
        }
        else if (celldata[0] == 0 && celldata[1] == 255 && celldata[2] == 0 && celldata[3] == 255) {
          map[y][x] = 4;
        }
        else if (celldata[0] == 0 && celldata[1] == 0 && celldata[2] == 255 && celldata[3] == 255) {
          map[y][x] = 5;
        }
      }
    }
    delete canvas;
    delete context;
    return map;
  }
  var getspawns = function(map) {
    var spawns = { "player": [], "enemies": [] };
    for (var y = 0; y < map.length; y++) {
      for (var x = 0; x < map[0].length; x++) {
        celldata = map[y][x];
        if (celldata == 1) {
          spawns.player = { "x": x, "y": y, "xvel": 0, "yvel": 0, "standing": false };
        }
        else if (celldata == 2) {
          spawns.enemies.push([x, y, 0]);
        }
        else if (celldata == 5) {
          end = [x, y];
        }
      }
    }
    return spawns;

  }
  //0 == air
  //1 == spawn
  //2 == enemy
  //3 == block
  //4 == jumper
  //5 == end
  var xval = 800;
  var yval = 500;
  var projectiles = [];
  var time = Date.now();
  var play_started = false;
  var animation_one = 102;
  var direction = 1;
  var ingamestarted = false;
  var currentlyingame = false;
  var screen = "main menu";
  var ImagesLoaded = [];
  var run = 1;
  var cooldowns = [0, 0, 0];
  var maxcooldowns = [175, 40, 1000]
  var animation_two = 101;
  var IntroImage = new Image();
  var hp = 15;
  var currentmap = Array(50).fill(0).map(x => Array(80).fill(0));
  var player = { "x": 0, "y": 0, "xvel": 0, "yvel": 0, "standing": false };
  var enemies = [];
  var end = [];
  var dialogue = false;
  var dialoguetext = [["Hello Jojo.", "Thank you for rescuing me.", "I was trapped here for 2 years.", "Captain Klenzendorf's Nazis kept me here, and forced me to work...", "as a nurse, for NO pay", "Please rescue the other Jews.", "They were trapped here and are helpless as I.", "I will give you a first aid kit.", "You can access it by pressing 1.", "It will almost fully heal you.", "There is a cooldown though.", "Good luck."], ["Hello and thank you for rescuing me.", "The Nazis captured me and forced me to fix lightbulbs.", "I am an electrician.", "Thankfully, I made a new invention.", "It is a electric gun.", "None of the Nazis found it.", "Take it so you can stun those Nazis.", "It will not stun forever.", "Press 2 to use it."], ["Thank you for rescuing me", "I am a shoemaker.", "The Nazis use me to make assemble leather furniture.", "Since this is a labor camp, they can sell those furnitures.", "They make so much money and give us none.", "Take these shoes I made.", "They will give you extra movement and jump before they wear out.", "Don't worry, you can use them again after a cooldown.", "Press 3 to access them."], ["Hello Jojo, Im Yorki.", "Are you here to rescue me?", "I think I should not have joined the Nazis.", " There are bigger things to worry about than Jews, Jojo.", "There's Russians out there somewhere.", "I'm not sure we chose the right side.", "And now Hitler's gone. We're really on our own.", "You didn't hear? He's dead. He gave up and blew his brains out.", "Blew them out. His brains.", "Turns out, he was hiding a lot of stuff from us.", "Doing some really bad things behind everyone's backs."]];
  var dialoguestart = 0;
  var eprojectiles = [];
  var gamestart = 0;
  var facingright = true;
  var selectedpower = -1;
  var unlockedpowers = 0;
  var step = 0;
  for (var i = 0; i < prisons.length; i++) {
    prisons[i].state = "locked";
    prisons[i].mapdata = "prison_" + (i + 1).toString() + "_mapdata";
    prisons[i].level = i + 1;
  }
  for (var i = 0; i < powers.length; i++) {
    powers[i].state = "locked";
  }
  prisons[0].state = "ready";
  var level = 1;
  IntroImage.onload = function() { ImagesLoaded.push(1); };
  IntroImage.src = "./Intro.png";
  var prison_one = new Image();
  var prison_two = new Image();
  var prison_three = new Image();
  var prison_four = new Image();
  var playerimage = new Image();
  var enemyimage = new Image();
  var jewimage = new Image()
  playerimage.src = "./SpriteSheetPlayer.png";
  enemyimage.src = "./SpriteSheetEnemy.png";
  jewimage.src = "./SpriteSheetJew.png";


  var prison_1_mapdata = Array(50).fill(0).map(x => Array(80).fill(0));
  var prison_2_mapdata = Array(50).fill(0).map(x => Array(80).fill(0));
  var prison_3_mapdata = Array(50).fill(0).map(x => Array(80).fill(0));
  var prison_4_mapdata = Array(50).fill(0).map(x => Array(80).fill(0));

  prison_one.onload = function() {
    ImagesLoaded.push(2);
    prison_1_mapdata = getmapdata(prison_one);
  };
  playerimage.onload = function() {
    ImagesLoaded.push(3);
  };
  enemyimage.onload = function() {
    ImagesLoaded.push(4);
  };
  jewimage.onload = function() {
    ImagesLoaded.push(5);
  };
  prison_two.onload = function() {
    ImagesLoaded.push(6);
    prison_2_mapdata = getmapdata(prison_two);
  };
  prison_three.onload = function() {
    ImagesLoaded.push(7);
    prison_3_mapdata = getmapdata(prison_three);
  };
  prison_four.onload = function() {
    ImagesLoaded.push(8);
    prison_4_mapdata = getmapdata(prison_four);
  };
  prison_one.src = "./prison1map.png";
  prison_two.src = "./prison2map.png";
  prison_three.src = "./prison3map.png";
  prison_four.src = "./prison4map.png";

  var bound = function(a1, a2, a3) {
    if (a1 < a2) { return a2; }
    else if (a1 > a3) { return a3; }
    return a1;
  };
  var checkcollisions = function(a, b) {
    var coll = [false, 0, 0];
    var x2 = Math.max(a[0] + a[2] / 2, b[0] + b[2] / 2) - Math.min(a[0] - a[2] / 2, b[0] - b[2] / 2);
    if (x2 < a[2] + b[2]) {
      var y2 = Math.max(a[1] + a[3] / 2, b[1] + b[3] / 2) - Math.min(a[1] - a[3] / 2, b[1] - b[3] / 2);
      if (y2 < a[3] + b[3]) {
        coll[0] = true;
        if (a[3] + b[3] - y2 < a[2] + b[2] - x2) {
          coll[1] = [0, 1];
          if (a[1] < b[1]) {
            coll[1] = [0, -1];
          }
          if (coll[1][1] * a[5] > 0) {
            coll[0] = false;
          }
          coll[2] = a[3] + b[3] - y2;
        }
        if (a[3] + b[3] - y2 > a[2] + b[2] - x2) {
          coll[0] = true;
          coll[1] = [1, 0];
          if (a[0] < b[0]) {
            coll[1] = [-1, 0];
          }
          if (coll[1][0] * a[4] > 0) {
            coll[0] = false;
          }
          coll[2] = a[2] + b[2] - x2;
        }
      }
    }
    return coll;
  }
  var wallcollisions = function(m, p) {
    p.standing = false;
    for (var y = bound(Math.floor(p.y) - 4, 0, m.length - 1); y < bound(Math.floor(p.y) + 4, 0, m.length); y++) {
      for (var x = bound(Math.floor(p.x) - 3, 0, m[0].length - 1); x < bound(Math.floor(p.x) + 3, 0, m[0].length); x++) {
        if (m[y][x] == 3 || m[y][x] == 4) {
          var collision = checkcollisions([p.x, p.y - 0.75, 0.8, 1.4, p.xvel, p.yvel], [x, y, 1, 1]);
          if (collision[0]) {
            if (collision[1][0] == 0 && collision[1][1] == -1) {
              p.standing = true;
            }
            if (collision[1][1] == 0 && !((m[y][bound(x - 1, 0, m[0].length - 1)] == 3 || m[y][bound(x - 1, 0, m[0].length - 1)] == 4) && (m[y][bound(x + 1, 0, m[0].length - 1)] == 3 || m[y][bound(x + 1, 0, m[0].length - 1)] == 4))) {
              p.x += collision[1][0] * collision[2];
              if (m[y][x] == 4) {
                p.xvel = 1 * collision[1][0];
              }
              else if (m[y][x] == 3) {
                p.xvel = 0;
              }
            }
            if (collision[1][0] == 0 && !((m[bound(y - 1, 0, m.length - 1)][x] == 3 || m[bound(y - 1, 0, m.length - 1)][x] == 4) && (m[bound(y + 1, 0, m.length - 1)][x] == 3 || m[bound(y + 1, 0, m.length - 1)][x] == 4))) {
              p.y += collision[1][1] * collision[2];
              if (m[y][x] == 4) {
                p.yvel = 0.5 * collision[1][1];
                p.standing = false;
              }
              else if (m[y][x] == 3) {
                p.yvel = 0;
              }
            }
          }
          else {

          }
        }
      }
    }
  }
  var bulletcollisions = function(m, p, p2) {
    for (var y = bound(Math.floor(p.y) - 2, 0, m.length - 1); y < bound(Math.floor(p.y) + 4, 0, m.length); y++) {
      for (var x = bound(Math.floor(p.x) - 2, 0, m[0].length - 1); x < bound(Math.floor(p.x) + 3, 0, m[0].length); x++) {
        if (m[y][x] == 3 || m[y][x] == 4) {
          var collision = checkcollisions([p.x, p.y - 0.5, 0.25, 0.25, p.xvel, p.yvel], [x, y, 1, 1]);
          if (collision[0]) {
            return 2;
          }
        }
      }
    }
    var collision = checkcollisions([p.x, p.y - 0.5, 0.25, 0.25, p.xvel, p.yvel], [p2.x, p2.y, 0.8, 1.5]);
    if (collision[0]) {
      return 1;
    }
    return 0;
  }
  var draw = function() {
    if (time + 15 < Date.now()) {
      while (time + 15 < Date.now()) {
        time += 15;
      }
      canv = document.getElementById("Game");
      cont = canv.getContext("2d");
      cont.clearRect(0, 0, canv.width, canv.height);
      if (ingamestarted && !currentlyingame && screen != "ingame") {
        animation_two = 100;
        currentlyingame = true;
        screen = "ingame";
        gamestart = 0;
        projectiles = [];
        eprojectiles = [];
        cooldowns = [0, 0, 0];
      }

      if (screen == "main menu") {

        var an = animation_one;
        if (animation_one == -1) {
          an = 0;
          direction = 1;
          animation_one = 0;
        }
        else if (animation_one == 101) {
          an = 100;
          animation_one = 100;
          direction = -1;
        }
        else if (animation_one == 102) {
          an = 100;
        }
        cont.drawImage(IntroImage, 0, -canv.height + canv.height * (an / 100) ** 3, canv.width, canv.height);
        if (animation_one <= 101) {
          animation_one += direction;
          if (animation_one == 0 && direction == -1) {
            animation_one = 102;
            screen = "prison";
            document.getElementById("Back").style.display = "block";
            for (var i = 0; i < prisons.length; i++) {
              prisons[i].style.display = "block";
            }
          }
          else if (animation_one == 100 && direction == 1) {
            animation_one = 102;
            screen = "main menu";
            document.getElementById("Back").style.display = "none";
            document.getElementById("Play").style.display = "block";
            for (var i = 0; i < prisons.length; i++) {
              prisons[i].style.display = "none";
            }
          }
        }
      }
      else if (screen == "prison") {
        for (var i = 0; i < prisons.length; i++) {
          if (prisons[i].state == "ready" && !prisons[i].style.background.includes("./prison_ready.png")) {
            prisons[i].style.background = prisons[i].style.background.replaceAll("_done", "_ready");
            prisons[i].style.background = prisons[i].style.background.replaceAll("_locked", "_ready");
            prisons[i].disabled = false;
          }
          else if (prisons[i].state == "locked" && !prisons[i].style.background.includes("./prison_locked.png")) {
            prisons[i].style.background = prisons[i].style.background.replaceAll("_ready", "_locked");
            prisons[i].style.background = prisons[i].style.background.replaceAll("_done", "_locked");
            prisons[i].disabled = true;
          }
          else if (prisons[i].state == "done" && !prisons[i].style.background.includes("./prison_done.png")) {
            prisons[i].style.background = prisons[i].style.background.replaceAll("_ready", "_done");
            prisons[i].style.background = prisons[i].style.background.replaceAll("_locked", "_done");
            prisons[i].disabled = false;
          }
        }
      }
      else if (screen == "ingame") {
        if (currentlyingame) {
          if (!ingamestarted) {
            screen = "prison";
            currentlyingame = false;
            for (var i = 0; i < prisons.length; i++) {
              prisons[i].style.display = "block";
            }
            currentmap = [];
          }
          else {
            lastkeys = nowkeys;
            nowkeys = getkeys();
            if (!dialogue) {

              for (var i = 0; i < powers.length; i++) {
                if (unlockedpowers >= i + 1) {
                  if (nowkeys["power " + (i + 1).toString()]) {
                    selectedpower = i;
                  }
                  if (selectedpower == i) {
                    document.getElementById("highlighter").style.top = powers[i].style.top;
                  }
                  powers[i].state = "ready";
                  document.getElementById("highlighter" + (i + 2)).style.display = "block";
                  var p = (maxcooldowns[i] - cooldowns[i]) / (maxcooldowns[i]);
                  document.getElementById("highlighter" + (i + 2)).style.height = (120 * (p)).toString() + "px";
                  if (p == 1) {
                    document.getElementById("highlighter" + (i + 2)).style["background-color"] = "red";
                  }
                  else {
                    document.getElementById("highlighter" + (i + 2)).style["background-color"] = "blue";
                    if (i == 2 && cooldowns[i] > 200) {
                      document.getElementById("highlighter" + (i + 2)).style["background-color"] = "green";
                    }
                  }


                }
                else {
                  powers[i].state = "locked";
                }
                powers[i].style.display = "block";
                if (unlockedpowers > 0) {
                  document.getElementById("highlighter").style.display = "block";
                }
                if (powers[i].state == "ready" && !powers[i].style.background.includes("_ready")) {
                  powers[i].style.background = powers[i].style.background.replaceAll("_locked", "_ready");
                  powers[i].disabled = false;
                }
                else if (powers[i].state == "locked" && !powers[i].style.background.includes("_locked")) {
                  powers[i].style.background = powers[i].style.background.replaceAll("_ready", "_locked");
                  powers[i].disabled = true;
                }

              }
              if (gamestart == 0) {
                gamestart = Date.now();
              }
              for (var i = 0; i < cooldowns.length; i++) {
                if (cooldowns[i] > 0) {
                  cooldowns[i] -= 1;
                }
              }
              if (hp <= 0) {
                hp = 15;
                cooldowns = [0, 0, 0];
                projectiles = [];
                eprojectiles = [];
                player.x = spawndata.player.x;
                player.y = spawndata.player.y;
                player.xvel = 0;
                player.yvel = 0;
              }

              wallcollisions(currentmap, player);

              for (var i = eprojectiles.length - 1; i >= 0; i--) {
                var e = bulletcollisions(currentmap, eprojectiles[i], player);
                if (e == 1 || e == 2) {
                  delete eprojectiles[i];
                  eprojectiles.splice(i, 1);
                }
                if (e == 1) {
                  hp -= 1;

                }
                if (e == 0) {
                  if (eprojectiles[i].xvel) {
                    eprojectiles[i].x += 0.1;
                  }
                  else {
                    eprojectiles[i].x -= 0.1;
                  }
                  cont.fillStyle = "red";
                  cont.fillRect((eprojectiles[i].x + 0.25) * canv.width / currentmap[0].length, (eprojectiles[i].y + 0.25) * canv.height / currentmap.length - canv.height / currentmap.length, 0.5 * canv.width / currentmap[0].length, 0.5 * canv.height / currentmap.length);
                }
              }
              for (var i = projectiles.length - 1; i >= 0; i--) {
                cont.fillStyle = "blue";
                cont.fillRect((projectiles[i].x + 0.25) * canv.width / currentmap[0].length, (projectiles[i].y + 0.25) * canv.height / currentmap.length - canv.height / currentmap.length, 0.5 * canv.width / currentmap[0].length, 0.5 * canv.height / currentmap.length);

                if (projectiles[i].xvel) {
                  projectiles[i].x += 0.3;
                }
                else {
                  projectiles[i].x -= 0.3;
                }

                for (var i2 = 0; i2 < enemies.length; i2++) {
                  var e1 = { "x": enemies[i2][0], "y": enemies[i2][1], "xvel": 0, "yvel": 0 };
                  var e = bulletcollisions(currentmap, projectiles[i], e1);
                  if (e == 1) {
                    enemies[i2][2] = 300;
                  }
                  if (e == 2) {
                    delete projectiles[i];
                    projectiles.splice(i, 1);
                    break;
                  }
                }


              }
              if (nowkeys.up && player.standing) {
                player.yvel -= 0.28 + (run - 1) * 0.023;
              }
              if (nowkeys.right) {
                facingright = true;
                step += 0.1;
                if (player.xvel < 0.15 * run) {
                  player.xvel += 0.0075;
                }
              }
              if (nowkeys.left) {
                facingright = false;
                step += 0.1;
                if (player.xvel > -0.15 * run) {
                  player.xvel -= 0.0075;
                }
              }
              if (nowkeys.special) {
                if (cooldowns[selectedpower] == 0) {
                  if (selectedpower <= unlockedpowers) {
                    if (selectedpower == 1) {
                      projectiles.push({ "x": player.x, "y": player.y + 0.25, "xvel": facingright, "yvel": 0 });
                      cooldowns[selectedpower] = maxcooldowns[selectedpower];
                      projectiles.push({ "x": player.x, "y": player.y - 0.75, "xvel": facingright, "yvel": 0 });
                      cooldowns[selectedpower] = maxcooldowns[selectedpower];
                    }
                    else if (selectedpower == 0) {
                      hp += 10;
                      if (hp > 15) {
                        hp = 15;
                      }
                      cooldowns[selectedpower] = maxcooldowns[selectedpower];
                    }
                    else if (selectedpower == 2) {
                      run = 3;
                      cooldowns[selectedpower] = maxcooldowns[selectedpower];;

                    }
                  }
                }
              }
              if (cooldowns[2] < 200) {
                run = 1;
              }
              player.yvel += 0.0075;
              if (player.standing) {
                player.yvel -= 0.006;
              }
              player.xvel = bound(player.xvel, -3, 3);
              player.yvel = bound(player.yvel, -3, 0.2);
              player.x += player.xvel;
              player.y += player.yvel;
              player.xvel *= 0.98;
              if (!(nowkeys.left || nowkeys.right) && player.standing && Math.abs(player.xvel) < 0.5) {
                player.xvel *= 0.75;
              }





              for (var i = 0; i < enemies.length; i++) {
                if (enemies[i][2] > 0) {
                  enemies[i][2] -= 1;
                }
                cont.fillStyle = "rgba(255,0,0,255)";
                if (enemies[i][2] > 0) {
                  cont.fillStyle = "rgba(50,50,255,200)";
                }
                right = 1;
                if (player.x - enemies[i][0] > 0) {
                  right = 0;
                }
                if (enemies[i][2] > 0) {
                  right = 2;
                }
                cont.drawImage(enemyimage, 20 * right, 0, 20, 40, (enemies[i][0] + 0.1) * canv.width / currentmap[0].length, (enemies[i][1] + 0.5) * canv.height / currentmap.length - canv.height / currentmap.length, 0.8 * canv.width / currentmap[0].length, 1.5 * canv.height / currentmap.length)
              }
              cont.drawImage(jewimage, (level - 1) * 200, 0, 200, 400, end[0] * canv.width / currentmap[0].length, end[1] * canv.height / currentmap.length - canv.height / currentmap.length, canv.width / currentmap[0].length, 2 * canv.height / currentmap.length);

              if (gamestart + 1000 < Date.now()) {
                while (gamestart + 1000 < Date.now()) {
                  gamestart += 1000;
                }
                for (var i = 0; i < enemies.length; i++) {
                  if (enemies[i][2] == 0) {
                    eprojectiles.push({ "x": enemies[i][0], "y": enemies[i][1] + 0.75, "xvel": player.x - enemies[i][0] > 0, "yvel": 0 });
                  }
                }
              }
              if (checkcollisions([end[0], end[1], 1, 2, 0, 0], [player.x, player.y, 1, 2, player.xvel, player.yvel])[0]) {
                dialogue = true;
                gamestart = 0;
              }


              for (var y = 0; y < currentmap.length; y++) {
                for (var x = 0; x < currentmap[0].length; x++) {

                  var color = 0;
                  if (currentmap[y][x] == 3) {
                    color = "rgba(0,0,0,255)";
                  }
                  else if (currentmap[y][x] == 4) {
                    color = "rgba(0,255,0,255)";
                  }
                  if (color != 0) {
                    cont.fillStyle = color;
                    cont.fillRect(x * canv.width / currentmap[0].length, y * canv.height / currentmap.length, canv.width / currentmap[0].length, canv.height / currentmap.length);
                  }

                }
              }
              cont.drawImage(playerimage, ((Math.floor(step) % 4) + 4 * (facingright ? 0 : 1)) * 20, 0, 20, 40, (player.x + 0.1) * canv.width / currentmap[0].length, player.y * canv.height / currentmap.length - canv.height / currentmap.length, 0.8 * canv.width / currentmap[0].length, 1.5 * canv.height / currentmap.length);
              cont.fillStyle = "black";
              cont.fillRect((player.x - 0.5) * canv.width / currentmap[0].length, player.y * canv.height / currentmap.length + 1.25 * canv.height / currentmap.length, 2 * canv.width / currentmap[0].length, 0.5 * canv.height / currentmap.length);
              cont.fillStyle = "rgba(0,255,0,255)";
              cont.fillRect((player.x - 0.5) * canv.width / currentmap[0].length, player.y * canv.height / currentmap.length + 1.25 * canv.height / currentmap.length, hp / 7.5 * canv.width / currentmap[0].length, 0.5 * canv.height / currentmap.length);
            }
            else {
              if (unlockedpowers < level) {
                unlockedpowers = level;
                prisons[level - 1].state = "done";
                if (level < prisons.length) {
                  prisons[level].state = "ready";
                }
              }
              if (gamestart == 0) {
                gamestart = Date.now();
                dialoguestart = 0;
              }
              document.getElementById("Back").style.display = "none";
              for (var i = 0; i < powers.length; i++) {
                powers[i].style.display = "none";
              }
              document.getElementById("highlighter").style.display = "none"; document.getElementById("highlighter2").style.display = "none"; document.getElementById("highlighter3").style.display = "none"; document.getElementById("highlighter4").style.display = "none";
              if (nowkeys.up && !lastkeys.up) {
                dialoguestart += 1;
                if (dialoguestart >= dialoguetext[level - 1].length) {
                  document.getElementById("Back").click();
                  document.getElementById("Back").style.display = "block";
                  dialogue = false;
                }
              }
              cont.drawImage(jewimage, (level - 1) * 200, 0, 200, 400, (5 + (1000 / (Date.now() - gamestart + 10)) ** 2) * canv.width / currentmap[0].length, 5 * canv.height / currentmap.length, 20 * canv.width / currentmap[0].length, 40 * canv.height / currentmap.length);
              cont.fillStyle = "rgba(209,212,131)";
              cont.fillRect(0, 35 * canv.height / currentmap.length, 80 * canv.width / currentmap[0].length, 15 * canv.height / currentmap.length);
              cont.fillStyle = "rgba(184,186,141)";
              cont.fillRect(5 * canv.width / currentmap[0].length, 37.5 * canv.height / currentmap.length, 70 * canv.width / currentmap[0].length, 10 * canv.height / currentmap.length);
              cont.font = "20px Arial";
              cont.fillStyle = "black";
              cont.fillText(dialoguetext[level - 1][bound(dialoguestart, 0, dialoguetext[level - 1].length - 1)], 7.5 * canv.width / currentmap[0].length, 42 * canv.height / currentmap.length);

            }
          }
        }
      }
      if (screen != "ingame") {
        for (var i = 0; i < powers.length; i++) {
          powers[i].style.display = "none";
        }
        document.getElementById("highlighter").style.display = "none"; document.getElementById("highlighter2").style.display = "none"; document.getElementById("highlighter3").style.display = "none"; document.getElementById("highlighter4").style.display = "none";
      }
    }
    window.requestAnimationFrame(draw);
  }
  var interval = setInterval(function() {
    if (ImagesLoaded.length == 8) {
      draw();
      clearInterval(interval);
      return;
    }
  }, 10);
})();