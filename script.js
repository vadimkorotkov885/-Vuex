const store = new Vuex.Store({
	state: {
		history: [],
		calculator: {
			displayValue: '',
			previousValue: null,
			operation: null,
			waitingForOperand: false,
			expression: '',
			lastOperation: null,
		},
	},
	mutations: {
		APPEND(state, number) {
			if (['+', '-', '*', '/'].includes(number)) {
				if (state.calculator.displayValue === '' && number === '-') {
					state.calculator.displayValue = '-'
					return
				}

				if (
					state.calculator.displayValue === '' ||
					state.calculator.displayValue === '-'
				)
					return

				if (state.calculator.operation && !state.calculator.waitingForOperand) {
					this.commit('CALCULATE')
				}

				state.calculator.expression =
					state.calculator.displayValue + ' ' + number
				state.calculator.previousValue = parseFloat(
					state.calculator.displayValue
				)
				state.calculator.operation = number
				state.calculator.waitingForOperand = true
				state.calculator.lastOperation = number
			} else {
				if (state.calculator.waitingForOperand) {
					state.calculator.displayValue = String(number)
					state.calculator.waitingForOperand = false
					state.calculator.expression += ' ' + state.calculator.displayValue
				} else {
					state.calculator.displayValue =
						state.calculator.displayValue === '0'
							? String(number)
							: state.calculator.displayValue + number
					if (state.calculator.operation) {
						state.calculator.expression =
							state.calculator.previousValue +
							' ' +
							state.calculator.operation +
							' ' +
							state.calculator.displayValue
					}
				}
			}
		},
		CLEAR(state) {
			state.calculator.displayValue = ''
			state.calculator.previousValue = null
			state.calculator.operation = null
			state.calculator.waitingForOperand = false
			state.calculator.expression = ''
			state.calculator.lastOperation = null
		},
		CALCULATE(state) {
			if (state.calculator.operation && !state.calculator.waitingForOperand) {
				const currentValue = parseFloat(state.calculator.displayValue)
				let result

				switch (state.calculator.operation) {
					case '+':
						result = state.calculator.previousValue + currentValue
						break
					case '-':
						result = state.calculator.previousValue - currentValue
						break
					case '*':
						result = state.calculator.previousValue * currentValue
						break
					case '/':
						result = state.calculator.previousValue / currentValue
						break
					default:
						return
				}

				const historyItem = {
					expression:
						state.calculator.previousValue +
						' ' +
						state.calculator.operation +
						' ' +
						currentValue,
					result: result,
					timestamp: new Date().toLocaleString(),
				}
				state.history.unshift(historyItem)
				if (state.history.length > 10) {
					state.history.pop()
				}

				state.calculator.expression =
					state.calculator.previousValue +
					' ' +
					state.calculator.operation +
					' ' +
					currentValue +
					' ='
				state.calculator.displayValue = String(result)
				state.calculator.previousValue = result
				state.calculator.operation = null
				state.calculator.waitingForOperand = true
			}
		},
		ADD_TO_HISTORY(state, item) {
			state.history.unshift(item)
			if (state.history.length > 10) {
				state.history.pop()
			}
		},
	},
	actions: {
		append({ commit }, number) {
			commit('APPEND', number)
		},
		clear({ commit }) {
			commit('CLEAR')
		},
		calculate({ commit }) {
			commit('CALCULATE')
		},
	},
	getters: {
		getHistory: state => state.history,
		getCalculatorState: state => state.calculator,
	},
})

const Calculator = {
	template: `
		<v-container class="fill-height" fluid>
			<v-row align="center" justify="center">
				<v-col cols="12" sm="8" md="6">
					<div class="nav-buttons">
						<v-btn to="/" color="primary">Калькулятор</v-btn>
						<v-btn to="/history" color="secondary">История</v-btn>
					</div>
					<v-card class="calculator">
						<v-card-text class="expression">{{ calculator.expression }}</v-card-text>
						<v-card-text class="display">{{ calculator.displayValue || '0' }}</v-card-text>
						<v-card-actions>
							<v-row>
								<v-col cols="12">
									<v-row>
										<v-col cols="3" v-for="n in [7,8,9,'/']" :key="n">
											<v-btn block @click="append(n)" :class="{ 'operation-btn': ['/','*','-','+'].includes(n) }">
												{{ n }}
											</v-btn>
										</v-col>
									</v-row>
									<v-row>
										<v-col cols="3" v-for="n in [4,5,6,'*']" :key="n">
											<v-btn block @click="append(n)" :class="{ 'operation-btn': ['/','*','-','+'].includes(n) }">
												{{ n }}
											</v-btn>
										</v-col>
									</v-row>
									<v-row>
										<v-col cols="3" v-for="n in [1,2,3,'-']" :key="n">
											<v-btn block @click="append(n)" :class="{ 'operation-btn': ['/','*','-','+'].includes(n) }">
												{{ n }}
											</v-btn>
										</v-col>
									</v-row>
									<v-row>
										<v-col cols="3">
											<v-btn block @click="clear" class="clear-btn">C</v-btn>
										</v-col>
										<v-col cols="3">
											<v-btn block @click="append(0)">0</v-btn>
										</v-col>
										<v-col cols="3">
											<v-btn block @click="append('.')">.</v-btn>
										</v-col>
										<v-col cols="3">
											<v-btn block @click="append('+')" class="operation-btn">+</v-btn>
										</v-col>
									</v-row>
									<v-row>
										<v-col cols="12">
											<v-btn block @click="calculate" class="equals-btn" large>=</v-btn>
										</v-col>
									</v-row>
								</v-col>
							</v-row>
						</v-card-actions>
					</v-card>
				</v-col>
			</v-row>
		</v-container>
	`,
	computed: {
		calculator() {
			return this.$store.getters.getCalculatorState
		},
	},
	methods: {
		append(number) {
			this.$store.dispatch('append', number)
		},
		clear() {
			this.$store.dispatch('clear')
		},
		calculate() {
			this.$store.dispatch('calculate')
		},
	},
}

const History = {
	template: `
		<v-container>
			<div class="nav-buttons">
				<v-btn to="/" color="primary">Калькулятор</v-btn>
				<v-btn to="/history" color="secondary">История</v-btn>
			</div>
			<v-card>
				<v-card-title>История вычислений</v-card-title>
				<v-card-text>
					<v-list v-if="history.length">
						<v-list-item v-for="(item, index) in history" :key="index" class="history-item">
							<v-list-item-content>
								<v-list-item-title>{{ item.expression }} = {{ item.result }}</v-list-item-title>
								<v-list-item-subtitle>{{ item.timestamp }}</v-list-item-subtitle>
							</v-list-item-content>
						</v-list-item>
					</v-list>
					<v-alert v-else type="info">История вычислений пуста</v-alert>
				</v-card-text>
			</v-card>
		</v-container>
	`,
	computed: {
		history() {
			return this.$store.getters.getHistory
		},
	},
}

const router = new VueRouter({
	routes: [
		{ path: '/', component: Calculator },
		{ path: '/history', component: History },
	],
})

new Vue({
	el: '#app',
	vuetify: new Vuetify(),
	router,
	store,
})
