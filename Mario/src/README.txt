###############################
#            MARIO            #
###############################
game.coins = 0 (from 0 to 99)
game.lifes = 3 (from 0 to infinite)
game.marioState = 0 (0=small Mario, 1=big Mario, 2= big Mario with flower)
game.worldNumber = 1
game.levelNumber = 1

###############################
#            ITEMS            #
###############################

coin.type = 0
transferElement.type= 1 (from top to bottom)
transferElement.type= 2 (from left to right)
flagItem.type=3
stick.type=4
mushroom.type=5 (classic red mushroom)

###############################
#             MAP             #
###############################

this.mapType  -> 0=scrolling map, 1=no scrolling (for bonus stage)
this.mapWorld -> 0=background_overworld, 1=background_underworld

###############################
#           ENEMIES           #
###############################

goomba.type = 0
piranhaPlant.type = 1

###############################
#         TRANSPARENCY        #
###############################

No collision for items with type=100
mystery.type = 0
coin.type = 100 (coin ejected by a mystery bloc)
element.type = 100 (element added to simulate the wall animation when small Mario jumps and collides a wall above his head)
