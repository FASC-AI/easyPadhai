class OnlineTestModel1 {
  int? code;
  bool? status;
  String? message;
  List<OnlineTestModel1Data>? data;

  OnlineTestModel1({this.code, this.status, this.message, this.data});

  OnlineTestModel1.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <OnlineTestModel1Data>[];
      json['data'].forEach((v) {
        data!.add(new OnlineTestModel1Data.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class OnlineTestModel1Data {
  String? publishedDate;
  String? topic;
  List<Tests>? tests;

  OnlineTestModel1Data({this.publishedDate, this.topic, this.tests});

  OnlineTestModel1Data.fromJson(Map<String, dynamic> json) {
    publishedDate = json['publishedDate'];
    topic = json['topic'];
    if (json['tests'] != null) {
      tests = <Tests>[];
      json['tests'].forEach((v) {
        tests!.add(new Tests.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['publishedDate'] = this.publishedDate;
    data['topic'] = this.topic;
    if (this.tests != null) {
      data['tests'] = this.tests!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Tests {
  String? sId;
  String? code;
  String? type;
  String? testType;
  String? description;
  String? descriptionSol;
  // List<Subject>? subject;
  // List<Class>? class;
  String? optionText1;
  String? mark1;
  String? duration;
  String? publishedBy;
  String? publishedDate;
  String? publishedTime;
  String? createdAt;
  String? updatedAt;
  bool? isActive;
  bool? isPublished;
  String? questionType;
  // List<Book>? book;
  // List<Lesson>? lesson;
  // List<Topic>? topic;
  bool? option1;
  bool? option2;
  bool? option3;
  bool? option4;
  String? mark2;
  String? mark3;
  String? mark4;
  String? totalTrue;
  String? optionText2;
  String? optionText3;
  String? optionText4;
  String? optionAssertionText1;
  String? optionAssertionText2;
  String? optionAssertionText3;
  String? optionAssertionText4;
  bool? optionAssertion1;
  bool? optionAssertion2;
  bool? optionAssertion3;
  bool? optionAssertion4;
  String? markAssertion1;
  String? markAssertion2;
  String? markAssertion3;
  String? markAssertion4;
  String? optionTrue;
  String? markTrue;
  String? optionFalse;
  String? markFalse;
  int? codeExtra;
  int? iV;

  Tests(
      {this.sId,
      this.code,
      this.type,
      this.testType,
      this.description,
      this.descriptionSol,
      this.optionText1,
      this.mark1,
      this.duration,
      this.publishedBy,
      this.publishedDate,
      this.publishedTime,
      this.createdAt,
      this.updatedAt,
      this.isActive,
      this.isPublished,
      this.questionType,
      //  this.book, this.lesson, this.topic,
      this.option1,
      this.option2,
      this.option3,
      this.option4,
      this.mark2,
      this.mark3,
      this.mark4,
      this.totalTrue,
      this.optionText2,
      this.optionText3,
      this.optionText4,
      this.optionAssertionText1,
      this.optionAssertionText2,
      this.optionAssertionText3,
      this.optionAssertionText4,
      this.optionAssertion1,
      this.optionAssertion2,
      this.optionAssertion3,
      this.optionAssertion4,
      this.markAssertion1,
      this.markAssertion2,
      this.markAssertion3,
      this.markAssertion4,
      this.optionTrue,
      this.markTrue,
      this.optionFalse,
      this.markFalse,
      this.codeExtra,
      this.iV});

  Tests.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    code = json['code'];
    type = json['type'];
    testType = json['testType'];
    description = json['description'];
    // descriptionSol = json['descriptionSol'];
    // if (json['subject'] != null) {
    // 	subject = <Subject>[];
    // 	json['subject'].forEach((v) { subject!.add(new Subject.fromJson(v)); });
    // }
    // if (json['class'] != null) {
    // 	class = <Class>[];
    // 	json['class'].forEach((v) { class!.add(new Class.fromJson(v)); });
    // }
    optionText1 = json['optionText1'];
    mark1 = json['mark1'];
    duration = json['duration'];
    publishedBy = json['publishedBy'];
    publishedDate = json['publishedDate'];
    publishedTime = json['publishedTime'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    isActive = json['isActive'];
    isPublished = json['isPublished'];
    questionType = json['questionType'];
    // if (json['book'] != null) {
    // 	book = <Book>[];
    // 	json['book'].forEach((v) { book!.add(new Book.fromJson(v)); });
    // }
    // if (json['lesson'] != null) {
    // 	lesson = <Lesson>[];
    // 	json['lesson'].forEach((v) { lesson!.add(new Lesson.fromJson(v)); });
    // }
    // if (json['topic'] != null) {
    // 	topic = <Topic>[];
    // 	json['topic'].forEach((v) { topic!.add(new Topic.fromJson(v)); });
    // }
    option1 = json['option1'];
    option2 = json['option2'];
    option3 = json['option3'];
    option4 = json['option4'];
    mark2 = json['mark2'];
    mark3 = json['mark3'];
    mark4 = json['mark4'];
    totalTrue = json['totalTrue'];
    optionText2 = json['optionText2'];
    optionText3 = json['optionText3'];
    optionText4 = json['optionText4'];
    optionAssertionText1 = json['optionAssertionText1'];
    optionAssertionText2 = json['optionAssertionText2'];
    optionAssertionText3 = json['optionAssertionText3'];
    optionAssertionText4 = json['optionAssertionText4'];
    optionAssertion1 = json['optionAssertion1'];
    optionAssertion2 = json['optionAssertion2'];
    optionAssertion3 = json['optionAssertion3'];
    optionAssertion4 = json['optionAssertion4'];
    markAssertion1 = json['markAssertion1'];
    markAssertion2 = json['markAssertion2'];
    markAssertion3 = json['markAssertion3'];
    markAssertion4 = json['markAssertion4'];
    optionTrue = json['optionTrue'];
    markTrue = json['markTrue'];
    optionFalse = json['optionFalse'];
    markFalse = json['markFalse'];
    codeExtra = json['codeExtra'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['code'] = this.code;
    data['type'] = this.type;
    data['testType'] = this.testType;
    data['description'] = this.description;
    data['descriptionSol'] = this.descriptionSol;
    // if (this.subject != null) {
    //   data['subject'] = this.subject!.map((v) => v.toJson()).toList();
    // }
    // if (this.class != null) {
    //   data['class'] = this.class!.map((v) => v.toJson()).toList();
    // }
    data['optionText1'] = this.optionText1;
    data['mark1'] = this.mark1;
    data['duration'] = this.duration;
    data['publishedBy'] = this.publishedBy;
    data['publishedDate'] = this.publishedDate;
    data['publishedTime'] = this.publishedTime;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['isActive'] = this.isActive;
    data['isPublished'] = this.isPublished;
    data['questionType'] = this.questionType;
    // if (this.book != null) {
    //   data['book'] = this.book!.map((v) => v.toJson()).toList();
    // }
    // if (this.lesson != null) {
    //   data['lesson'] = this.lesson!.map((v) => v.toJson()).toList();
    // }
    // if (this.topic != null) {
    //   data['topic'] = this.topic!.map((v) => v.toJson()).toList();
    // }
    data['option1'] = this.option1;
    data['option2'] = this.option2;
    data['option3'] = this.option3;
    data['option4'] = this.option4;
    data['mark2'] = this.mark2;
    data['mark3'] = this.mark3;
    data['mark4'] = this.mark4;
    data['totalTrue'] = this.totalTrue;
    data['optionText2'] = this.optionText2;
    data['optionText3'] = this.optionText3;
    data['optionText4'] = this.optionText4;
    data['optionAssertionText1'] = this.optionAssertionText1;
    data['optionAssertionText2'] = this.optionAssertionText2;
    data['optionAssertionText3'] = this.optionAssertionText3;
    data['optionAssertionText4'] = this.optionAssertionText4;
    data['optionAssertion1'] = this.optionAssertion1;
    data['optionAssertion2'] = this.optionAssertion2;
    data['optionAssertion3'] = this.optionAssertion3;
    data['optionAssertion4'] = this.optionAssertion4;
    data['markAssertion1'] = this.markAssertion1;
    data['markAssertion2'] = this.markAssertion2;
    data['markAssertion3'] = this.markAssertion3;
    data['markAssertion4'] = this.markAssertion4;
    data['optionTrue'] = this.optionTrue;
    data['markTrue'] = this.markTrue;
    data['optionFalse'] = this.optionFalse;
    data['markFalse'] = this.markFalse;
    data['codeExtra'] = this.codeExtra;
    data['__v'] = this.iV;
    return data;
  }
}
