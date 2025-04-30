class BatchModel {
  int? code;
  bool? status;
  String? message;
  BatchData? data;

  BatchModel({this.code, this.status, this.message, this.data});

  BatchModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new BatchData.fromJson(json['data']) : null;
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

class BatchData {
  String? subjectId;
  String? classId;
  String? code;
  String? classTeacherId;
  String? sId;
  String? createdAt;
  String? updatedAt;
  int? iV;

  BatchData(
      {this.subjectId,
      this.classId,
      this.code,
      this.classTeacherId,
      this.sId,
      this.createdAt,
      this.updatedAt,
      this.iV});

  BatchData.fromJson(Map<String, dynamic> json) {
    subjectId = json['subjectId'];
    classId = json['classId'];
    code = json['code'];
    classTeacherId = json['classTeacherId'];
    sId = json['_id'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['subjectId'] = this.subjectId;
    data['classId'] = this.classId;
    data['code'] = this.code;
    data['classTeacherId'] = this.classTeacherId;
    data['_id'] = this.sId;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    return data;
  }
}

