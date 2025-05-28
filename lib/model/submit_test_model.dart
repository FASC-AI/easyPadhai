class SubmitTestModel {
  int? code;
  bool? status;
  String? message;
  SubmitTestModelData? data;

  SubmitTestModel({this.code, this.status, this.message, this.data});

  SubmitTestModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new SubmitTestModelData.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class SubmitTestModelData {
  String? userId;
  List<Test>? test;
  String? sId;
  String? createdAt;
  String? updatedAt;
  int? iV;

  SubmitTestModelData(
      {this.userId,
      this.test,
      this.sId,
      this.createdAt,
      this.updatedAt,
      this.iV});

  SubmitTestModelData.fromJson(Map<String, dynamic> json) {
    userId = json['userId'];
    if (json['test'] != null) {
      test = <Test>[];
      json['test'].forEach((v) {
        test!.add(new Test.fromJson(v));
      });
    }
    sId = json['_id'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['userId'] = this.userId;
    if (this.test != null) {
      data['test'] = this.test!.map((v) => v.toJson()).toList();
    }
    data['_id'] = this.sId;
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
