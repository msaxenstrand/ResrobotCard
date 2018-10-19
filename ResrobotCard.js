import {
  LitElement, html
} from 'https://unpkg.com/@polymer/lit-element@^0.5.2/lit-element.js?module';

class ResrobotCard extends LitElement {

  static get properties() {
    return {
      hass: Object,
      config: Object,
      open: Boolean,
      show_buses: Boolean,
      show_next_text: Boolean
    }
  }

  constructor() {
    super();
    this.open = false;
    this._toggle = this._toggle.bind(this)
  }

  _toggle() {
    this.open = !this.open
  }

  getColor(minutesLeft){
    const value = minutesLeft > 20 ? 0 : 1 - minutesLeft / 20
    var hue=((1-value)*120).toString(10);
    return ["hsl(",hue,",60%,50%)"].join("");
  }

  getBusPos(state) {
    const thisBusMinLeft = state.attributes['diff'] ? state.attributes['diff'] : 0
    const nextBusMinLeft = state.attributes['next_diff']
    const timeBetween = (nextBusMinLeft - thisBusMinLeft) * 2
    console.log(thisBusMinLeft)
    console.log(nextBusMinLeft)
    console.log(timeBetween)
    console.log([(thisBusMinLeft / timeBetween * 100), (nextBusMinLeft / timeBetween * 100)])

    return [(thisBusMinLeft / timeBetween * 100), (nextBusMinLeft / timeBetween * 100)]
  }

  _render({ hass, config, open, show_buses, show_next_text }) {
    const state = hass.states[config.entity];
    const leavesIn = state ? state.state : 'unavailable';

    return html`
      <style>${style}</style>
      <ha-card id="departure-card">
        <div class="road">

          <div class="bus this-bus" style="left: ${this.getBusPos(state)[0]}%">
            <div class="timeleft" style="background-color: ${this.getColor(leavesIn)}">
              <div class="triangle" style="border-color: ${this.getColor(leavesIn)} transparent transparent transparent"></div>
              <span class="leaves-in">${leavesIn}</span>
            </div>
            <div class="bus-wrapper">
              <ha-icon id="bus-icon" icon="mdi:bus-side"></ha-icon>
            </div>
          </div>

          <div class="bus next-bus" style="left: ${this.getBusPos(state)[1]}%">
            <div class="timeleft" style="background-color: ${this.getColor(state.attributes['next_diff'])}">
              <div class="triangle" style="border-color: ${this.getColor(state.attributes['next_diff'])} transparent transparent transparent"></div>
              <span class="leaves-in">${state.attributes['next_diff']}</span>
            </div>
            <div class="bus-wrapper">
              <ha-icon id="bus-icon" icon="mdi:bus-side"></ha-icon>
            </div>
          </div>

        </div>
        <div class="card-content">
          <div class="header">${leavesIn === 'Nu' ? html`Bussen går <strong>nu</strong>` : html`Bussen går om <strong style="color: ${this.getColor(leavesIn)}">${leavesIn}</strong> minuter`}</div>
          <div class="next-text">Nästa buss går om <strong style="color: ${this.getColor(state.attributes['next_diff'])}">${state.attributes['next_diff']}</strong> minuter</div>
          <ha-icon id="chevron-icon" icon="${open ? 'mdi:chevron-up' : 'mdi:chevron-down'}" on-click="${this._toggle}"></ha-icon>
          <div class="departure-table">
            ${state.attributes['board'].map((departure, index) => {
              if (index > config.num_rows - 1 || !open) return
              return html`
                <div class="departure">
                  <ha-icon id="state-icon" icon="mdi:bus"></ha-icon>
                  <div class="departure-content">
                    <div class="left">
                      <span class="name">${departure.name}</span>
                      <span class="info">Avgår om ${departure.diff} minuter från ${departure.stop}
                    </div>
                    <div class="right">
                      <span class="time">${departure['time']}</span>
                    </div>
                  </div>
                </div>
              `
            }
          )}
          </div>
        </div>
      </ha-card>
    `
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define entities');
    }
    this.config = config;
  }
}

customElements.define('resrobot-card', ResrobotCard);

const style = `
  ha-card {
    position: relative;
  }
  .card-content {
    padding: 16px;
    position: relative;
  }
  .header {
    font-size: 24px;
    font-weight: 300;
    color: #333333;
  }
  .next-text {
    font-size: 18px;
    font-weight: 300;
    color: #555555;
  }
  .departure-table {
    margin-top: 8px;
  }
  .departure {
    display: flex;
    flex-direction: row;
    padding-bottom: 8px;
    position: relative;
  }
  .departure::after {
    content: '';
    background: #dedede;
    width: 2px;
    position: absolute;
    left: 16px;;
    height: 100%;
    z-index: 1;
  }
  .departure-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
  .left, .right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: 1;
  }
  .left {
    padding: 0 5px;
    flex: 1;
  }
  .name {
    font-size: 16px;
  }
  .info {
    font-size: 12px;
    color: #ababab;
  }
  ha-icon#chevron-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    background: #cdcdcd;
    color: #ffffff;
    border-radius: 50%;
  }
  ha-icon#state-icon {
    color: #ffffff;
    background: var(--primary-color);
    padding: 6px;
    border-radius: 50%;
    box-shadow: 0 2px 5px rgba(0,0,0,0.25);
    position: relative;
    z-index: 2;
  }
  .road {
    height: 60px;
    position: relative;
    width: calc(100%);
    border-bottom: 2px solid #eeeeee;
    margin-bottom: 8px;
    overflow: hidden;
    background: linear-gradient(to bottom, #5cb6ff, #bde0ff);
  }
  .bus {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    color: #ffffff;
    width: 30px;
    position: absolute;
    bottom: -6px;
    transition: left 1500ms ease;
  }
  .bus-wrapper {
    margin-top: 5px;
  }
  .timeleft {
    position: relative;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    color: #ffffff;
    text-align: center;
    background-color: #666666;
  }
  .leaves-in {
    font-size: 18px;
    line-height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: -2px;
    margin-left: -2px;
  }
  .triangle {
    position: absolute;
    bottom: -10px;
    left: calc(50% - 5px);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 12px 5px 0 5px;
    border-color: #666666 transparent transparent transparent;
  }
  ha-icon#bus-icon {
    transform: rotate3d(0, 1, 0, 180deg);
    color: #ffffff;
  }
`
