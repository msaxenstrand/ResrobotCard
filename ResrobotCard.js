import {
  LitElement, html
} from 'https://unpkg.com/@polymer/lit-element@^0.5.2/lit-element.js?module';

class ResrobotCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
    }
  }

  _render({ hass, config }) {
    const state = hass.states[config.entity];
    const leavesIn = state ? state.state : 'unavailable';

    console.log(state)

    return html`
      <style>${style}</style>
      <ha-card id="departure-card">
        <div class="header">${leavesIn === 'Nu' ? html`Bussen går <strong>nu</strong>` : html`Bussen går om <strong>${leavesIn}</strong> minuter`}</div>
        <div class="next-text">Nästa buss går om <strong>${state.attributes['next_diff']}</strong> minuter</div>
        <div class="departure-table">
          ${state.attributes['board'].map((departure, index) => {
            if (index > config.num_rows - 1) return
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
    padding: 16px;
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
    margin-bottom: 8px;
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
    color: #555555;
  }
  ha-icon {
    color: #ffffff;
    background: #cdcdcd;
    padding: 6px;
    border-radius: 50%;
  }
`