// https://github.com/BiggerSeries/Phosphophyllite/blob/50de26b9325551a1a7f5f1fff23164254c0e3ee0/src/main/java/net/roguelogix/phosphophyllite/repack/org/joml/Vector3d.java

// Minimal needed Vector3d class
class Vector3d {
  x = 0.0;
  y = 0.0;
  z = 0.0;
  
  set(...args) {
    if(args.length == 1) {
      if(args instanceof Vector3d) {
        this.x = args.x;
        this.y = args.y;
        this.z = args.z;
        return;
      }
      this.x = args;
      this.y = args;
      this.z = args;
      return;
    }
    if(args.length == 3) {
      [this.x, this.y, this.z] = args;
      return;
    }
    throw Error('Invalid arguments');
  }
  
  add(x, y, z) {
    this.x += x;
    this.y += y;
    this.z += z;
  }
  
  sub(x, y, z) {
    this.x -= x;
    this.y -= y;
    this.z -= z;
  }
  
  mul(n) {
    this.x *= n;
    this.y *= n;
    this.z *= n;
  }
  
  lengthSquared() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  
  length() {
    return Math.sqrt(this.lengthSquared());
  }
  
  normalize() {
    const length = this.length();
    this.x /= length;
    this.y /= length;
    this.z /= length;
  }
  
  absolute() {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
    this.z = Math.abs(this.z);
  }
  
  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
  }
  
  get(idx) {
    if(i == 0) return this.x;
    if(i == 1) return this.y;
    if(i == 2) return this.z;
    throw RangeError();
  }
  
  setComponent(idx, value) {
    if(i == 0) { this.x = value; return; }
    if(i == 1) { this.y = value; return; }
    if(i == 2) { this.z = value; return; }
    throw RangeError();
  }
  
  maxComponent() {
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    const absZ = Math.abs(z);
    if (absX >= absY && absX >= absZ) {
        return 0;
    } else if (absY >= absZ) {
        return 1;
    }
    return 2;
  }

}

export { Vector3d }
