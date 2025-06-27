class PrevTestModel {
  int? code;
  bool? status;
  String? message;
  List<PrevTestModelData>? data;

  PrevTestModel({this.code, this.status, this.message, this.data});

  PrevTestModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <PrevTestModelData>[];
      json['data'].forEach((v) {
        data!.add(new PrevTestModelData.fromJson(v));
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

class PrevTestModelData {
  String? duration;
  String? publishedDate;
  String? publishedTime;
  List<Tests>? tests;
  List<String>? hindi;
  List<String>? description;

  PrevTestModelData(
      {this.duration,
      this.publishedDate,
      this.publishedTime,
      this.hindi,
      this.description,
      this.tests});

  PrevTestModelData.fromJson(Map<String, dynamic> json) {
    duration = json['duration'];
    publishedDate = json['publishedDate'];
    publishedTime = json['publishedTime'];
    hindi = json['hindi'].cast<String>();
    description = json['description'].cast<String>();
    if (json['tests'] != null) {
      tests = <Tests>[];
      json['tests'].forEach((v) {
        tests!.add(new Tests.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['duration'] = this.duration;
    data['publishedDate'] = this.publishedDate;
    data['publishedTime'] = this.publishedTime;
    data['hindi'] = this.hindi;
    data['description'] = this.description;
    if (this.tests != null) {
      data['tests'] = this.tests!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Tests {
  String? sId;
  String? userId;
  String? subjectId;
  String? classId;
  String? type;
  String? duration;
  String? publishedTime;
  String? publishedDate;
  String? publishedBy;
  List<InstructionId>? instructionId;
  TestId? testId;
  bool? isReaded;
  int? iV;
  String? createdAt;
  String? updatedAt;
  String? attempted;
  SubmitTestData? submitTestData;
  String? questionType;

  Tests(
      {this.sId,
      this.userId,
      this.subjectId,
      this.classId,
      this.type,
      this.duration,
      this.publishedTime,
      this.publishedDate,
      this.publishedBy,
      this.instructionId,
      this.testId,
      this.isReaded,
      this.iV,
      this.createdAt,
      this.updatedAt,
      this.attempted,
      this.submitTestData,
      this.questionType});

  Tests.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    userId = json['userId'];
    subjectId = json['subjectId'];
    classId = json['classId'];
    type = json['type'];
    duration = json['duration'];
    publishedTime = json['publishedTime'];
    publishedDate = json['publishedDate'];
    publishedBy = json['publishedBy'];
    if (json['instructionId'] != null) {
      instructionId = <InstructionId>[];
      json['instructionId'].forEach((v) {
        instructionId!.add(new InstructionId.fromJson(v));
      });
    }
    testId =
        json['testId'] != null ? new TestId.fromJson(json['testId']) : null;
    isReaded = json['isReaded'];
    iV = json['__v'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    attempted = json['attempted'];
    submitTestData = json['submitTestData'] != null
        ? new SubmitTestData.fromJson(json['submitTestData'])
        : null;
    questionType = json['questionType'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['userId'] = this.userId;
    data['subjectId'] = this.subjectId;
    data['classId'] = this.classId;
    data['type'] = this.type;
    data['duration'] = this.duration;
    data['publishedTime'] = this.publishedTime;
    data['publishedDate'] = this.publishedDate;
    data['publishedBy'] = this.publishedBy;
    if (this.instructionId != null) {
      data['instructionId'] =
          this.instructionId!.map((v) => v.toJson()).toList();
    }
    if (this.testId != null) {
      data['testId'] = this.testId!.toJson();
    }
    data['isReaded'] = this.isReaded;
    data['__v'] = this.iV;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['attempted'] = this.attempted;
    if (this.submitTestData != null) {
      data['submitTestData'] = this.submitTestData!.toJson();
    }
    data['questionType'] = this.questionType;
    return data;
  }
}

class InstructionId {
  String? sId;
  bool? isActive;
  String? type;
  String? description;
  String? instructionsName;
  List<Classes>? classes;
  List<Subjects>? subjects;
  String? createdAt;
  String? updatedAt;
  int? code;
  int? iV;
  String? hindi;

  InstructionId(
      {this.sId,
      this.isActive,
      this.type,
      this.description,
      this.instructionsName,
      this.classes,
      this.subjects,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV,
      this.hindi});

  InstructionId.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    isActive = json['isActive'];
    type = json['type'];
    description = json['description'];
    instructionsName = json['InstructionsName'];
    if (json['classes'] != null) {
      classes = <Classes>[];
      json['classes'].forEach((v) {
        classes!.add(new Classes.fromJson(v));
      });
    }
    if (json['subjects'] != null) {
      subjects = <Subjects>[];
      json['subjects'].forEach((v) {
        subjects!.add(new Subjects.fromJson(v));
      });
    }
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
    hindi = json['hindi'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['isActive'] = this.isActive;
    data['type'] = this.type;
    data['description'] = this.description;
    data['InstructionsName'] = this.instructionsName;
    if (this.classes != null) {
      data['classes'] = this.classes!.map((v) => v.toJson()).toList();
    }
    if (this.subjects != null) {
      data['subjects'] = this.subjects!.map((v) => v.toJson()).toList();
    }
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
    data['hindi'] = this.hindi;
    return data;
  }
}

class TestId {
  String? sId;
  String? codee;
  bool? isActive;
  String? type;
  String? testType;
  String? questionType;
  String? description;
  String? descriptionSol;
  List<Classes>? classes;
  // List<Subjects>? subjects;
  // List<Book>? book;
  // List<Lesson>? lesson;
  // List<Topic>? topic;
  bool? option1;
  bool? option2;
  bool? option3;
  bool? option4;
  String? mark1;
  String? mark2;
  String? mark3;
  String? mark4;
  String? totalTrue;
  String? optionText1;
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
  String? createdAt;
  String? updatedAt;
  int? code;
  int? iV;

  TestId(
      {this.sId,
      this.codee,
      this.isActive,
      this.type,
      this.testType,
      this.questionType,
      this.description,
      this.descriptionSol,
      this.classes,
      // this.subjects,
      // this.book,
      // this.lesson,
      // this.topic,
      this.option1,
      this.option2,
      this.option3,
      this.option4,
      this.mark1,
      this.mark2,
      this.mark3,
      this.mark4,
      this.totalTrue,
      this.optionText1,
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
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV});

  TestId.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    codee = json['codee'];
    isActive = json['isActive'];
    type = json['type'];
    testType = json['testType'];
    questionType = json['questionType'];
    description = json['description'];
    descriptionSol = json['descriptionSol'];
    if (json['classes'] != null) {
      classes = <Classes>[];
      json['classes'].forEach((v) {
        classes!.add(new Classes.fromJson(v));
      });
    }
    // if (json['subjects'] != null) {
    //   subjects = <Subjects>[];
    //   json['subjects'].forEach((v) {
    //     subjects!.add(new Subjects.fromJson(v));
    //   });
    // }
    // if (json['book'] != null) {
    //   book = <Book>[];
    //   json['book'].forEach((v) {
    //     book!.add(new Book.fromJson(v));
    //   });
    // }
    // if (json['lesson'] != null) {
    //   lesson = <Lesson>[];
    //   json['lesson'].forEach((v) {
    //     lesson!.add(new Lesson.fromJson(v));
    //   });
    // }
    // if (json['topic'] != null) {
    //   topic = <Topic>[];
    //   json['topic'].forEach((v) {
    //     topic!.add(new Topic.fromJson(v));
    //   });
    // }
    option1 = json['option1'];
    option2 = json['option2'];
    option3 = json['option3'];
    option4 = json['option4'];
    mark1 = json['mark1'];
    mark2 = json['mark2'];
    mark3 = json['mark3'];
    mark4 = json['mark4'];
    totalTrue = json['totalTrue'];
    optionText1 = json['optionText1'];
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
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['codee'] = this.codee;
    data['isActive'] = this.isActive;
    data['type'] = this.type;
    data['testType'] = this.testType;
    data['questionType'] = this.questionType;
    data['description'] = this.description;
    data['descriptionSol'] = this.descriptionSol;
    if (this.classes != null) {
      data['classes'] = this.classes!.map((v) => v.toJson()).toList();
    }
    // if (this.subjects != null) {
    //   data['subjects'] = this.subjects!.map((v) => v.toJson()).toList();
    // }
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
    data['mark1'] = this.mark1;
    data['mark2'] = this.mark2;
    data['mark3'] = this.mark3;
    data['mark4'] = this.mark4;
    data['totalTrue'] = this.totalTrue;
    data['optionText1'] = this.optionText1;
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
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
    return data;
  }
}

class Classes {
  String? sId;
  String? nameEn;

  Classes({this.sId, this.nameEn});

  Classes.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    nameEn = json['nameEn'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['nameEn'] = this.nameEn;
    return data;
  }
}

class Subjects {
  String? sId;
  String? nameEn;

  Subjects({this.sId, this.nameEn});

  Subjects.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    nameEn = json['nameEn'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['nameEn'] = this.nameEn;
    return data;
  }
}

class SubmitTestData {
  String? sId;
  String? publishedDate;
  String? publishedTime;
  String? duration;
  String? userId;
  List<Test>? test;
  String? createdAt;
  String? updatedAt;
  int? iV;

  SubmitTestData(
      {this.sId,
      this.publishedDate,
      this.publishedTime,
      this.duration,
      this.userId,
      this.test,
      this.createdAt,
      this.updatedAt,
      this.iV});

  SubmitTestData.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    publishedDate = json['publishedDate'];
    publishedTime = json['publishedTime'];
    duration = json['duration'];
    userId = json['userId'];
    if (json['test'] != null) {
      test = <Test>[];
      json['test'].forEach((v) {
        test!.add(new Test.fromJson(v));
      });
    }
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['publishedDate'] = this.publishedDate;
    data['publishedTime'] = this.publishedTime;
    data['duration'] = this.duration;
    data['userId'] = this.userId;
    if (this.test != null) {
      data['test'] = this.test!.map((v) => v.toJson()).toList();
    }
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    return data;
  }
}

class Test {
  String? questionId;
  List<String>? answer;
  String? sId;

  Test({this.questionId, this.answer, this.sId});

  Test.fromJson(Map<String, dynamic> json) {
    questionId = json['questionId'];
    answer = json['answer'].cast<String>();
    sId = json['_id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['questionId'] = this.questionId;
    data['answer'] = this.answer;
    data['_id'] = this.sId;
    return data;
  }
}
