const boltrotspeed = [8, 6, 18, 15, 24, 20];
const boltrotdir = [1, -1, -1, 1, 1, -1];
const boltCooldown = 0.05;
//var warmup = 0;
const voltmeter = extendContent(PowerTurret, "voltmeter", {
  load(){
    this.super$load();
    this.details = new DetailsData();
  },
  update(tile){
    this.super$update(tile);
    const entity = tile.ent();
    if (entity.power.status < 0.1){
      this.details.status = 0;
    }else if(entity.power.status > 0.9){
      this.details.status = 1;
    }else{
      var status = this.details.status;
      this.details.status = Mathf.lerpDelta(status, entity.power.status, boltCooldown);
    }
  },
  shoot(tile, type){
    const entity = tile.ent();
    var result = Predict.intercept(entity, entity.target, type.speed);
    if (result.isZero()){
      result.set(entity.target.getX(), entity.target.getY());
    }
    const targetRot = result.sub(tile.drawx(), tile.drawy()).angle();
    entity.heat = 1;
    Calls.createBullet(type, tile.getTeam(), tile.drawx(), tile.drawy(), targetRot, 1, 1);
    this.effects(tile);
    this.useAmmo(tile);
  },
  drawLayer(tile){
    this.super$drawLayer(tile);
    const entity = tile.ent();
    var status = this.details.status;
    var f = ((2 + Mathf.absin(Time.time(), 2, 0.5)) * Vars.tilesize) * status;
    Draw.rect(Core.atlas.find(this.name + "-top"), tile.drawx(), tile.drawy(), f, f);
    Draw.reset();
    Draw.blend(Blending.additive);
    for (var i = 1; i <= 6; i++){
      if (!Mathf.chance(status)){continue;}
      var j = i - 1;
      var rawrot = Time.time() * boltrotspeed[j] * boltrotdir[j];
      var truerot =
        rawrot > 0 ?
          (rawrot % 360)
        :
          (360 + (rawrot % 360));
      Draw.mixcol(Color.white, Mathf.absin(Time.time(), boltrotspeed[j] * 0.1, 0.5));
      Draw.alpha(status * (0.9 + Mathf.absin(Time.time(), boltrotspeed[j] * 0.1, 0.1)));
      Draw.rect(Core.atlas.find(this.name + "-bolt" + i), tile.drawx(), tile.drawy(), truerot);
      Draw.mixcol();
      Draw.color();
    }
    Draw.blend();
    Draw.reset();
  },
});
// storage for details data
function DetailsData(){
  this.status = 0;
}
