class LS {
  data;
  constructor() {
    this.data = {};
    const data = localStorage.getItem("cp-training-data");
    if (!data)
      localStorage.setItem("cp-training-data", JSON.stringify(this.data)),
        (data = {});
    else this.data = JSON.parse(data);
  }

  get(key) {
    const data = localStorage.getItem("cp-training-data");
    if (!data) return null;
    this.data = JSON.parse(data);
    if (!this.data[key]) return null;
    return this.data[key];
  }
  set(key, value) {
    this.data[key] = value;
    localStorage.setItem("cp-training-data", JSON.stringify(this.data));
    console.log(this.data);
  }
}

const ls = new LS();
export default ls;
