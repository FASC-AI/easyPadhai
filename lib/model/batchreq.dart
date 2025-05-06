class BatchReqModel {
  int? code;
  bool? status;
  String? message;
  List<BRData>? data;

  BatchReqModel({this.code, this.status, this.message, this.data});

  BatchReqModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <BRData>[];
      json['data'].forEach((v) {
        data!.add(new BRData.fromJson(v));
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

class BRData {
  String? id;
  Null? approve;
  String? userRole;
  String? name;
  String? roll;
  String? sections;
  String? class1;

  BRData(this.id,
      {this.approve,
      this.userRole,
      this.name,
      this.roll,
      this.sections,
      this.class1});

  BRData.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    approve = json['approve'];
    userRole = json['userRole'];
    name = json['name'];
    roll = json['roll'];
    sections = json['sections'];
    class1 = json['class'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['approve'] = this.approve;
    data['userRole'] = this.userRole;
    data['name'] = this.name;
    data['roll'] = this.roll;
    data['sections'] = this.sections;
    data['class'] = this.class1;
    return data;
  }
}
