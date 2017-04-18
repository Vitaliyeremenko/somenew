    window.App = {
        Models:{},
        Collections : {},
        Views: {},
        Router : {}
    };

    var superid = 4;
    window.template = function(id) {
            return _.template( $('#' + id).html() );
        };

    App.Models.Task = Backbone.Model.extend({
        validate : function(attrs) {
            if ( !$.trim(attrs.title) ){
                return 'Имя задачи должно быть валидным!';
            }
        }
    });

    App.Views.Task = Backbone.View.extend({
        initialize :function () {
            this.model.on('change', this.render, this);
            this.model.on('destroy', this.remove, this);
        },
        tagName: 'li',
        template : template('taskTemplate'),
        render: function() {
            var template = this.template(this.model.toJSON());
            this.$el.html( template);
            return this;
        },

        events:{
            'click span'    : 'editTask',
            'click .delete' : 'destroyIT',
            'click .toogle' : 'check'
        },

        destroyIT : function () {
            console.log(this.$el);
            console.log(this.model);
            this.model.destroy();
        },

        editTask : function(){
            var changeTask = new App.Views.ChangeTask ({collection : tasksCollection, id : this.model.get('id')});
            changeTask.showIt();
        },

        remove :function() {
            this.$el.remove();
        },

        check : function () {
            if(this.model.get('checked') == 0){
                this.model.set('checked',1);
                this.$el.find('input').attr('checked', 'checked');

            } else {
                this.model.set('checked',0);
            }
        }

    });

    App.Views.ChangeTask = Backbone.View.extend({
        el : '#changeTask',

        events : {
            'click .send' : 'send',
            'click .back' : 'back'
        },
        initialize : function () {

        },
        send : function(event){
            event.preventDefault();;
            var thisid = this.id;
            var newVal = this.$el.find("textarea").val();
            this.collection.models.forEach(function (elem, i) {
                if (elem.attributes.id == thisid){
                    elem.set({"title":newVal},{validate:true}) ;
                }
            });
            delete this.id;

            this.hideIt();
        },
        back : function () {
            event.preventDefault();
            this.hideIt();
        },
        showIt : function () {
            this.$el.show();
        },
        hideIt : function () {
            this.$el.hide();
        }
    });

    App.Views.AddTasks = Backbone.View.extend({
        el: '#addTask',

        events : {
            'submit' : 'submit'
        },
        initialize : function () {

        },
        submit : function (event) {
            event.preventDefault();

            var formNewTaskTitle = $(event.currentTarget).find("input[type=text]").val();

            var newTask = new App.Models.Task({title: formNewTaskTitle,checked : 0, id :superid++});

            this.collection.add(newTask)
            $(event.currentTarget).find("input[type=text]").val("");
        }
    });

    App.Views.CategoryShow = Backbone.View.extend({
        el :'div.categorys',

        events : {
            'click .all'        : 'showAll',
            'click .active'     : 'showActive',
            'click .completed'  : 'showCompleted'
        },
        initialize : function () {

        },
        showAll  : function () {
            tasksView.$el.children().each(function () {
              $(this).show();
            })
        },
        showActive : function () {
            tasksView.$el.children().each(function () {
                if(this.querySelector('input').checked == false){
                    $(this).show();
                }else{
                    $(this).hide();                }
            })
        },
        showCompleted : function () {
            tasksView.$el.children().each(function () {
                if(this.querySelector('input').checked != false){
                    $(this).show();
                }else{
                    $(this).hide();                }
            })
        }
    });

    App.Collections.Task = Backbone.Collection.extend({
        model : App.Models.Task
    });

    App.Views.Tasks = Backbone.View.extend({
        tagName : 'ul',

        initialize : function(){
            this.collection.on('add', this.addOne , this)
        },
        render : function() {
            this.collection.each(this.addOne, this);
            return this;
        },

        addOne : function(task) {
            var taskView = new App.Views.Task({model : task});

            this.$el.append(taskView.render().el);
        }


    });

    var tasksCollection =  new App.Collections.Task([
        {
            title: 'Сходить в магазин',
            checked : 0,
            id :1
        },
        {
            title: 'Получить почту',
            checked : 0,
            id :2
        },
        {
            title: 'Убить бомжа',
            checked : 1,
            id :3
        }
    ]);

    var tasksView = new App.Views.Tasks({collection : tasksCollection  });

    var addTaskView = new App.Views.AddTasks({collection : tasksCollection});

    var taskCategory = new App.Views.CategoryShow({collection : tasksCollection});

    $('.tasks').html(tasksView.render().el);
