app.factory('BudgetService', function() {
    
    var DAYS_TO_CALC = 181;
    
    function saveBudget(budget, currentBudgets) {
        var name = budget.n;
        if(!currentBudgets) {
            currentBudgets = [name];
        } else if(currentBudgets.indexOf(name) === -1) {
            currentBudgets.push(name);
        }
        localStorage['budgets'] = JSON.stringify(currentBudgets);
        localStorage['mybud-' + name.replace(/\s/g, '')] = JSON.stringify(budget);
    }
  
    function deleteBudget(name, budgets) {
        var i = budgets.indexOf(name);
        if(i >= 0) {
            budgets.splice(index, 1);
            localStorage['budgets'] = JSON.stringify(budgets);
            delete localStorage['mybud-' + name.replace(/\s/g, '')];
        }
    }
  
    function loadBudgets() {
        var cb = localStorage['budgets'];
        if(cb) {
            return JSON.parse(cb);
        }
    }
    
    function loadBudget(name) {
        var bn = localStorage['mybud-' + name.replace(/\s/g, '')];
        if(bn) {
            return JSON.parse(bn);
        } else {
            //TODO add error message
        }
    }
    
    function getExport(name) {
    	var ex = {
    			'budgets' : name
    	};
    	ex['mybud-' + name.replace(/\s/g, '')] = localStorage['mybud-' + name.replace(/\s/g, '')];
    	return JSON.stringify(ex);
    }
    
    function convertBudget(budget) {
        return {
            n: budget.name,
            d: budget.startDate,
            a: budget.startAmount,
            i: budget.transactions
        };
    }
    
    function convertToWeeks(arr) {
        var pad, i, weeks = [], days;
        if(arr && arr.length) {
            pad = moment.unix(arr[0].t).day();
            for(i = 0; i < pad; i++) {
                arr.unshift({
                    pad: true
                });
            }
            pad = moment.unix(arr[arr.length - 1].t).day();
            for(i = 0; i < (7 - pad); i++) {
                arr.push({
                    pad: true
                });
            }
            for(i = 0; i < arr.length; i++) {
                if(i % 7 === 0) {
                    if(days) {
                        weeks.push(days);
                    }
                    days = [];
                }
                days.push(arr[i]);
            }
            if(days.length) {
                weeks.push(days);
            }
        }
        return weeks;
    }
    
    function getIntervalObj(trans) {
        if(trans.t === 1) {
            return {
                s: trans.d,
                next: function() {
                    this.s = moment.unix(this.s).add('d', trans.i).unix();
                    return this.s;
                }
            };
        } else if(trans.t === 2) {
            return {
                s: trans.d,
                next: function() {
                    this.s = moment.unix(this.s).add('M', trans.i).unix();
                    return this.s;
                }
            };
        } else {
            return {
                s: trans.d
            };
        }
    }
    
    function createTranSet(budget, end) {
        var s, io, tSet = {
                i: [],
                o: []
            };
        if(budget.transactions && budget.transactions.length) {
            for(var i = 0; i < budget.transactions.length; i++) {
                s = [];
                io = getIntervalObj(budget.transactions[i]);
                budget.transactions[i].idx = i;
                if(io && io.s) {
                    if(io.s < budget.startDate) {
                        if(!io.next) {
                            break;
                        }
                        do {
                            s.next();
                        } while (io.s < budget.startDate);
                    }
                    if(io.s < end) {
                        s.push(io.s);
                        if(io.next) {
                            while(io.next() < end && (!budget.transactions[i].e || io.s < budget.transactions[i].e)) {
                                s.push(io.s);
                            }
                        }
                        tSet.i.push(s);
                        tSet.o.push(budget.transactions[i]);
                    }
                }
            }
        }
        return tSet;
    }

    function generateBudget(budget) {
        var end = moment().startOf('day').add('d', DAYS_TO_CALC).unix(),
            step = moment.unix(budget.startDate),
            arr = [],
            ph = [],
            tSet = createTranSet(budget, end),
            index;
        while(step.unix() < end) {
            ph.push(step.unix());
            arr.push({
                t: step.unix(),
                a: budget.startAmount,
                month: step.format('MMM'),
                day: step.format('D'),
                i: []
            });
            step.add('d', 1);
        }
        if(tSet && tSet.i) {
            for(var i = 0; i < tSet.i.length; i++) {
                for(var j = 0; j < tSet.i[i].length; j++) {
                    index = ph.indexOf(tSet.i[i][j]);
                    if(index >= 0) {
                        arr[index].i.push(tSet.o[i]);
                    }
                }
            }
        }
        for(var i = 0; i < arr.length; i++) {
            if(arr[i].i.length) {
                for(var j = 0; j < arr[i].i.length; j++) {
                	if(arr[i].i[j].cl !== false) {
	                	if(arr[i].i[j].ac && (arr[i].i[j].ac[arr[i].t] === 0 || arr[i].i[j].ac[arr[i].t])) {
	                		arr[i].a += arr[i].i[j].ac[arr[i].t];
	                	} else {
	                		arr[i].a += arr[i].i[j].a;
	                	}
                	}
                }
            }
            if((i + 1) < arr.length) {
                arr[i + 1].a = arr[i].a;
            }
        }
        return convertToWeeks(arr);
    }
    
    /*
      n - name
      d - start date
      a - start amount
      i - transactions
        i.t - transaction type    1 = day interval, 2 = month interval, otherwise single transaction
        i.i - interval
        i.d - start date
        i.e - end date
        i.a - amount
        i.n - transaction name
        i.c - transaction description
        i.w - payment website
        i.ac - map of changed payments
        i.p - map of paid bills,
        i.nt - notes,
        i.cl - ignore in calculation
    */
    return {
        name: '',
        startDate: null,
        startAmount: 0,
        transactions: [],
        weeks: [],
        budgets: [],
        
        load: function(name) {
            var b;
            if(!name) {
                this.budgets = loadBudgets();
                if(this.budgets && this.budgets.length === 1) {
                    b = loadBudget(this.budgets[0]);
                }
            } else {
                b = loadBudget(name);
            }
            if(b) {
                this.name = b.n;
                this.startDate = b.d;
                this.transactions = b.i;
                this.startAmount = b.a;
                this.weeks = generateBudget(this);
            }
        },
        
        create: function(name, amount) {
            this.name = name;
            this.startDate = moment().startOf('day').unix();
            this.startAmount= amount;
            this.transactions = [];
            saveBudget(convertBudget(this), this.budgets);
            this.weeks = generateBudget(this);
        },
        
        addTransaction: function(trans) {
            this.transactions.push(trans);
            saveBudget(convertBudget(this), this.budgets);
            this.weeks = generateBudget(this);
        },
        
        refresh: function() {
        	saveBudget(convertBudget(this), this.budgets);
        	this.weeks = generateBudget(this);
        },
        
        getExport: function() {
        	return getExport(this.name);
        }
    };
});